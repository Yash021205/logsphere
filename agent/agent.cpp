#include <iostream>
#include <vector>
#include <fstream>
#include <algorithm>
#include <string>
#include <unordered_map>
#include <sstream>
#include <ctime>

// --- OS-Specific Headers ---
#ifdef _WIN32
    #ifndef _WIN32_WINNT
    #define _WIN32_WINNT 0x0600
    #endif
    #include <windows.h>
    #include <psapi.h>
    #pragma comment(lib, "psapi.lib")
    #pragma warning(disable : 4996) // Disable getenv unsafe warning
#else
    #include <unistd.h>
    #include <dirent.h>
#endif

#include "httplib.h"
#include "json.hpp"
using json = nlohmann::json;

struct LogStat {
    int count;
    time_t firstSeen;
    time_t lastSeen;
};

// --- Cross-Platform Helper Functions ---

void agentSleep(int seconds) {
#ifdef _WIN32
    Sleep(seconds * 1000);
#else
    sleep(seconds);
#endif
}

std::string getHostname() {
#ifdef _WIN32
    char hostname[MAX_COMPUTERNAME_LENGTH + 1];
    DWORD size = sizeof(hostname);
    if (GetComputerNameA(hostname, &size)) {
        return std::string(hostname);
    }
    return "Unknown-Windows";
#else
    char hostname[1024];
    if (gethostname(hostname, 1024) == 0) {
        return std::string(hostname);
    }
    return "Unknown-Linux";
#endif
}

#ifdef _WIN32
static unsigned long long FileTimeToInt64(const FILETIME& ft) {
    return (((unsigned long long)(ft.dwHighDateTime)) << 32) | ((unsigned long long)ft.dwLowDateTime);
}
#endif

double getCPUUsage() {
#ifdef _WIN32
    static unsigned long long previousTotalTicks = 0;
    static unsigned long long previousIdleTicks = 0;

    FILETIME idleTime, kernelTime, userTime;
    typedef BOOL (WINAPI *GetSystemTimes_t)(LPFILETIME, LPFILETIME, LPFILETIME);
    static GetSystemTimes_t pGetSystemTimes = nullptr;
    if (!pGetSystemTimes) {
        HMODULE h = GetModuleHandleA("kernel32.dll");
        if (h) pGetSystemTimes = (GetSystemTimes_t)GetProcAddress(h, "GetSystemTimes");
    }
    if (pGetSystemTimes && pGetSystemTimes(&idleTime, &kernelTime, &userTime)) {
        unsigned long long idleTicks = FileTimeToInt64(idleTime);
        unsigned long long totalTicks = FileTimeToInt64(kernelTime) + FileTimeToInt64(userTime);

        unsigned long long totalTicksSinceLastTime = totalTicks - previousTotalTicks;
        unsigned long long idleTicksSinceLastTime  = idleTicks - previousIdleTicks;

        double ret = 0.0;
        if (totalTicksSinceLastTime > 0) {
            ret = 100.0 - ((100.0 * idleTicksSinceLastTime) / totalTicksSinceLastTime);
        }

        previousTotalTicks = totalTicks;
        previousIdleTicks = idleTicks;
        return ret;
    }
    return 0.0;
#else
    std::ifstream file("/proc/stat");
    std::string cpu;
    long user, nice, system, idle;
    if (file >> cpu >> user >> nice >> system >> idle) {
        long total = user + nice + system + idle;
        if (total > 0) return (double)(total - idle) / total * 100.0;
    }
    return 0.0;
#endif
}

double getMemoryUsage() {
#ifdef _WIN32
    MEMORYSTATUSEX memInfo;
    memInfo.dwLength = sizeof(MEMORYSTATUSEX);
    if (GlobalMemoryStatusEx(&memInfo)) {
        DWORDLONG totalPhysMem = memInfo.ullTotalPhys;
        DWORDLONG physMemUsed = memInfo.ullTotalPhys - memInfo.ullAvailPhys;
        if (totalPhysMem > 0) return (double)physMemUsed / totalPhysMem * 100.0;
    }
    return 0.0;
#else
    std::ifstream file("/proc/meminfo");
    std::string key;
    long memTotal = 0, memAvailable = 0;
    while (file >> key) {
        if (key == "MemTotal:")
            file >> memTotal;
        else if (key == "MemAvailable:") {
            file >> memAvailable;
            break;
        }
    }
    if (memTotal > 0) return (double)(memTotal - memAvailable) / memTotal * 100.0;
    return 0.0;
#endif
}

int getProcessCount() {
#ifdef _WIN32
    DWORD aProcesses[1024], cbNeeded, cProcesses;
    if (EnumProcesses(aProcesses, sizeof(aProcesses), &cbNeeded)) {
        cProcesses = cbNeeded / sizeof(DWORD);
        return (int)cProcesses;
    }
    return 0;
#else
    DIR *dir = opendir("/proc");
    struct dirent *entry;
    int count = 0;
    if (dir != NULL) {
        while ((entry = readdir(dir)) != NULL) {
            if (entry->d_type == DT_DIR) {
                std::string name = entry->d_name;
                if (std::all_of(name.begin(), name.end(), ::isdigit)) {
                    count++;
                }
            }
        }
        closedir(dir);
    }
    return count;
#endif
}

// --- End Cross-Platform Helpers ---

std::vector<std::string> readNewLogs(const std::string &path, long &lastPos) {
    std::ifstream file(path);
    if (!file.is_open()) return {};
    file.seekg(lastPos);
    
    std::vector<std::string> logs;
    std::string line;
    
    while (std::getline(file, line)) {
        if (!line.empty())
            logs.push_back(line);
    }
    
    lastPos = file.tellg();
    if (lastPos == -1) lastPos = 0; 
    
    return logs;
}

std::string normalizeLog(const std::string &log) {
    size_t pos = log.find(" at ");
    if (pos != std::string::npos)
        return log.substr(0, pos);
    return log;
}

json aggregateLogs(const std::vector<std::string> &logs,
                   std::unordered_map<std::string, LogStat> &store)
{
    time_t now = time(nullptr);
    for (const auto &log : logs) {
        std::string key = normalizeLog(log);
        if (store.find(key) == store.end()) {
            store[key] = {1, now, now};
        } else {
            store[key].count++;
            store[key].lastSeen = now;
        }
    }

    json result = json::array();
    for (auto &it : store) {
        json entry;
        entry["message"] = it.first;
        entry["count"] = it.second.count;
        entry["first_seen"] = it.second.firstSeen;
        entry["last_seen"] = it.second.lastSeen;
        result.push_back(entry);
    }
    return result;
}

int main() {
    std::string host = getHostname();
    long lastPos = 0;
    int heartbeat = 0;

    std::unordered_map<std::string, LogStat> logStore;

    // Read config.json
    std::string sysIdStr;
    std::string sysKeyStr;

    std::ifstream configFile("config.json");
    if (configFile.is_open()) {
        try {
            json config = json::parse(configFile);
            if (config.contains("systemId") && config["systemId"].is_string()) {
                sysIdStr = config["systemId"].get<std::string>();
            }
            if (config.contains("systemKey") && config["systemKey"].is_string()) {
                sysKeyStr = config["systemKey"].get<std::string>();
            }
        } catch (...) {
            std::cerr << "Error parsing config.json. Make sure it's valid JSON.\n";
        }
    }

    // Fallback to environment variables if not found in config
    if (sysIdStr.empty() && getenv("SYSTEM_ID")) {
        sysIdStr = getenv("SYSTEM_ID");
    }
    if (sysKeyStr.empty() && getenv("SYSTEM_KEY")) {
        sysKeyStr = getenv("SYSTEM_KEY");
    }

    if (sysIdStr.empty() || sysKeyStr.empty()) {
        std::cerr << "CRITICAL ERROR: systemId or systemKey not found!\n"
                  << "Please create a config.json file with these keys or set the SYSTEM_ID and SYSTEM_KEY environment variables.\n";
        return 1; // Exit immediately if credentials are missing
    }

    std::string ingestUrl = "http://localhost:5000";
    if (getenv("LOGSPHERE_URL")) {
        ingestUrl = getenv("LOGSPHERE_URL");
    }
    
    httplib::Client cli(ingestUrl.c_str());
    cli.set_connection_timeout(5, 0);
    cli.set_read_timeout(5, 0); 
    cli.set_write_timeout(5, 0);

    std::string logFilePath = "app.log";
#ifndef _WIN32
    logFilePath = "/var/log/syslog";
#endif

    if (getenv("LOG_FILE_PATH")) {
        logFilePath = getenv("LOG_FILE_PATH");
    }

    while (true) {
        heartbeat++;

        double cpu = getCPUUsage();
        double mem = getMemoryUsage();
        int processes = getProcessCount();

        auto newLogs = readNewLogs(logFilePath, lastPos);
        auto aggregated = aggregateLogs(newLogs, logStore);

        std::cout << "CPU: " << cpu
                  << "% | Memory: " << mem
                  << "% | Processes: " << processes << "\n";

        json payload;
        payload["systemId"] = sysIdStr;
        payload["systemKey"] = sysKeyStr;
        payload["host"] = host;
        payload["cpu"] = cpu;
        payload["memory"] = mem;
        payload["processes"] = processes;
        payload["timestamp"] = time(nullptr);

        if (!aggregated.empty())
            payload["logs"] = aggregated;

        if (heartbeat % 2 == 0 || !aggregated.empty()) {
            std::string data = payload.dump();
            std::cout << "Aggregating Telemetry to " << ingestUrl << "/ingest ...\n";
            auto res = cli.Post("/ingest", data, "application/json");
            if (res) {
                if (res->status == 200) {
                    std::cout << "Successfully delivered to SaaS Backend!\n";
                } else {
                    std::cerr << "Failed to deliver (Status: " << res->status << "): " << res->body << "\n";
                }
            } else {
                auto err = res.error();
                std::cerr << "HTTP POST Error: " << httplib::to_string(err) << "\n";
            }
        }

        if (!aggregated.empty())
            logStore.clear();

        agentSleep(5);
    }
    
    return 0;
}
