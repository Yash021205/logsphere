#include <iostream>
#include <vector>
#include <fstream>
#include <algorithm>
#include <string>
#include <unistd.h>
#include <dirent.h>
#include "json.hpp"
#include <ctime>
using json = nlohmann::json;

double getCPUUsage() {
    std::ifstream file("/proc/stat");
    std::string cpu;
    long user, nice, system, idle;

    file >> cpu >> user >> nice >> system >> idle;
    long total = user + nice + system + idle;

    return (double)(total - idle) / total * 100.0;
}

std::vector<std::string> readNewLogs(const std::string& path, long &lastPos) {
    std::ifstream file(path);
    file.seekg(lastPos);

    std::vector<std::string> logs;
    std::string line;
    while (std::getline(file, line)) {
    if (!line.empty())
        logs.push_back(line);
}
    lastPos = file.tellg();
    return logs;
}

double getMemoryUsage() {
    std::ifstream file("/proc/meminfo");
    std::string key;
    long memTotal = 0, memAvailable = 0;

    while(file >> key) {
        if(key == "MemTotal:") {
            file >> memTotal;
        }
        else if(key == "MemAvailable:") {
            file >> memAvailable;
            break;
        }
    }

    return (double)(memTotal - memAvailable) / memTotal * 100.0;
}

int getProcessCount() {
    DIR* dir = opendir("/proc");
    struct dirent* entry;
    int count = 0;

    while((entry = readdir(dir)) != NULL) {
        if(entry->d_type == DT_DIR) {
            std::string name = entry->d_name;
            if(std::all_of(name.begin(), name.end(), ::isdigit)) {
                count++;
            }
        }
    }

    closedir(dir);
    return count;
}

struct LogStat {
    int count;
    time_t firstSeen;
    time_t lastSeen;
};

std::string normalizeLog(const std::string& log) {
    size_t pos = log.find(" at ");
    if (pos != std::string::npos)
        return log.substr(0, pos);
    return log;
}

json aggregateLogs(const std::vector<std::string>& logs,
                   std::unordered_map<std::string, LogStat>& store) {

    time_t now = time(nullptr);

    for (const auto& log : logs) {

        // Normalize log (remove timestamp etc.)
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
    long lastPos = 0;
    int heartbeat = 0;
    std::unordered_map<std::string, LogStat> logStore;

    while(true) {
        heartbeat++;

        double cpu = getCPUUsage();
        double mem = getMemoryUsage();
        int processes = getProcessCount();

        auto newLogs = readNewLogs("app.log", lastPos);
        auto aggregated = aggregateLogs(newLogs, logStore);

        std::cout << "CPU: " << cpu 
                  << "% | Memory: " << mem 
                  << "% | Processes: " << processes << "\n";

        // Build JSON payload
        json payload;
        payload["host"] = "yash-machine";
        payload["cpu"] = cpu;
        payload["memory"] = mem;
        payload["processes"] = processes;
        payload["timestamp"] = time(nullptr);

        if (!aggregated.empty())
            payload["logs"] = aggregated;

        // Send telemetry intelligently
        if (heartbeat % 2 == 0 || !aggregated.empty()) {
            std::string data = payload.dump();
            std::cout << "Sending: " << data << "\n";
        }
        if (!aggregated.empty())
        logStore.clear();

        sleep(5);
    }
}
