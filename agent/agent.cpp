#include <iostream>
#include <vector>
#include <fstream>
#include <algorithm>
#include <string>
#include <unordered_map>
#include <sstream>
#include <ctime>

#ifdef _WIN32
    #ifndef _WIN32_WINNT
    #define _WIN32_WINNT 0x0A00
    #endif
    #include <winsock2.h>
    #include <windows.h>
    #include <psapi.h>
    #include <winevt.h>
    #pragma comment(lib, "psapi.lib")
    #pragma comment(lib, "wevtapi.lib")
    #pragma warning(disable : 4996)
#else
    #include <unistd.h>
    #include <dirent.h>
#endif

#include "httplib.h"
#include "json.hpp"
using json = nlohmann::json;

// ── Install directory — credentials live here permanently ────────
#ifdef _WIN32
    // C:\ProgramData\LogSphere\config.json  (machine-wide; survives service accounts)
    const std::string INSTALL_DIR  = std::string(getenv("PROGRAMDATA") ? getenv("PROGRAMDATA") : "C:\\ProgramData") + "\\LogSphere";
    const std::string CONFIG_PATH  = INSTALL_DIR + "\\config.json";
#else
    const std::string INSTALL_DIR  = "/etc/logsphere";
    const std::string CONFIG_PATH  = INSTALL_DIR + "/config.json";
#endif

struct LogStat {
    int count;
    time_t firstSeen;
    time_t lastSeen;
};

// ── All existing helper functions unchanged ──────────────────────

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
    if (GetComputerNameA(hostname, &size)) return std::string(hostname);
    return "Unknown-Windows";
#else
    char hostname[1024];
    if (gethostname(hostname, 1024) == 0) return std::string(hostname);
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
    static unsigned long long previousIdleTicks  = 0;
    FILETIME idleTime, kernelTime, userTime;
    typedef BOOL (WINAPI *GetSystemTimes_t)(LPFILETIME, LPFILETIME, LPFILETIME);
    static GetSystemTimes_t pGetSystemTimes = nullptr;
    if (!pGetSystemTimes) {
        HMODULE h = GetModuleHandleA("kernel32.dll");
        if (h) pGetSystemTimes = (GetSystemTimes_t)GetProcAddress(h, "GetSystemTimes");
    }
    if (pGetSystemTimes && pGetSystemTimes(&idleTime, &kernelTime, &userTime)) {
        unsigned long long idleTicks  = FileTimeToInt64(idleTime);
        unsigned long long totalTicks = FileTimeToInt64(kernelTime) + FileTimeToInt64(userTime);
        unsigned long long totalDiff  = totalTicks - previousTotalTicks;
        unsigned long long idleDiff   = idleTicks  - previousIdleTicks;
        double ret = 0.0;
        if (totalDiff > 0) ret = 100.0 - ((100.0 * idleDiff) / totalDiff);
        previousTotalTicks = totalTicks;
        previousIdleTicks  = idleTicks;
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
        DWORDLONG total = memInfo.ullTotalPhys;
        DWORDLONG used  = memInfo.ullTotalPhys - memInfo.ullAvailPhys;
        if (total > 0) return (double)used / total * 100.0;
    }
    return 0.0;
#else
    std::ifstream file("/proc/meminfo");
    std::string key;
    long memTotal = 0, memAvailable = 0;
    while (file >> key) {
        if (key == "MemTotal:")     file >> memTotal;
        else if (key == "MemAvailable:") { file >> memAvailable; break; }
    }
    if (memTotal > 0) return (double)(memTotal - memAvailable) / memTotal * 100.0;
    return 0.0;
#endif
}

int getProcessCount() {
#ifdef _WIN32
    DWORD aProcesses[1024], cbNeeded;
    if (EnumProcesses(aProcesses, sizeof(aProcesses), &cbNeeded))
        return (int)(cbNeeded / sizeof(DWORD));
    return 0;
#else
    DIR *dir = opendir("/proc");
    struct dirent *entry;
    int count = 0;
    if (dir) {
        while ((entry = readdir(dir)) != NULL) {
            std::string name = entry->d_name;
            if (entry->d_type == DT_DIR &&
                std::all_of(name.begin(), name.end(), ::isdigit))
                count++;
        }
        closedir(dir);
    }
    return count;
#endif
}

std::vector<std::string> readNewLogs(const std::string &path, long &lastPos) {
    std::ifstream file(path);
    if (!file.is_open()) return {};
    file.seekg(lastPos);
    std::vector<std::string> logs;
    std::string line;
    while (std::getline(file, line))
        if (!line.empty()) logs.push_back(line);
    lastPos = file.tellg();
    if (lastPos == -1) lastPos = 0;
    return logs;
}

std::string normalizeLog(const std::string &log) {
    size_t pos = log.find(" at ");
    if (pos != std::string::npos) return log.substr(0, pos);
    return log;
}

#ifdef _WIN32
// ════════════════════════════════════════════════════════════════
// Windows Event Log reader (Vista+ EvtQuery API)
//
// Reads Warning (Level=3) and Error (Level=2) events from the
// Application and System channels.  lastRecordId is updated to
// the highest EventRecordID seen so events are never re-read.
// ════════════════════════════════════════════════════════════════

static std::string wideToUtf8(const wchar_t* w) {
    if (!w || !*w) return "";
    int len = WideCharToMultiByte(CP_UTF8, 0, w, -1, nullptr, 0, nullptr, nullptr);
    if (len <= 0) return "";
    std::string out(len, '\0');
    WideCharToMultiByte(CP_UTF8, 0, w, -1, &out[0], len, nullptr, nullptr);
    while (!out.empty() && out.back() == '\0') out.pop_back();
    return out;
}

std::vector<std::string> readWindowsEventLog(long &lastRecordId) {
    std::vector<std::string> result;

    std::wstring xpath = L"*[System[(Level=2 or Level=3)";
    if (lastRecordId > 0)
        xpath += L" and EventRecordID>" + std::to_wstring(lastRecordId);
    xpath += L"]]";

    const wchar_t* channels[] = { L"Application", L"System" };

    for (auto* channel : channels) {
        EVT_HANDLE hQuery = EvtQuery(
            NULL, channel, xpath.c_str(),
            EvtQueryChannelPath | EvtQueryForwardDirection);
        if (!hQuery) continue;

        EVT_HANDLE hEvent = nullptr;
        DWORD fetched = 0;

        while (EvtNext(hQuery, 1, &hEvent, 5000, 0, &fetched) && fetched > 0) {
            DWORD needed = 0, propCount = 0;
            // First call: get required buffer size
            EvtRender(NULL, hEvent, EvtRenderEventXml, 0, nullptr, &needed, &propCount);

            if (GetLastError() == ERROR_INSUFFICIENT_BUFFER && needed > 0) {
                std::vector<wchar_t> xmlBuf(needed / sizeof(wchar_t) + 2, 0);
                if (EvtRender(NULL, hEvent, EvtRenderEventXml, needed,
                              xmlBuf.data(), &needed, &propCount)) {

                    std::wstring xml = xmlBuf.data();

                    // Extract text between <Tag>...</Tag>
                    auto extract = [&](const std::wstring& tag) -> std::wstring {
                        std::wstring o = L"<" + tag + L">",
                                     c = L"</" + tag + L">";
                        auto s = xml.find(o), e = xml.find(c);
                        if (s == std::wstring::npos || e == std::wstring::npos) return L"";
                        return xml.substr(s + o.size(), e - s - o.size());
                    };

                    // Track highest RecordID
                    std::wstring recIdW = extract(L"EventRecordID");
                    if (!recIdW.empty()) {
                        try { long r = std::stol(recIdW); if (r > lastRecordId) lastRecordId = r; }
                        catch (...) {}
                    }

                    // Severity label
                    std::string levelLabel = "Warning";
                    if (extract(L"Level") == L"2") levelLabel = "Error";

                    // Provider name for EvtFormatMessage
                    std::wstring provider;
                    auto np = xml.find(L"Name='");
                    if (np != std::wstring::npos) {
                        np += 6;
                        auto ne = xml.find(L"'", np);
                        if (ne != std::wstring::npos) provider = xml.substr(np, ne - np);
                    }

                    // Format human-readable message
                    std::string message;
                    EVT_HANDLE hMeta = EvtOpenPublisherMetadata(
                        NULL, provider.empty() ? nullptr : provider.c_str(), NULL, 0, 0);
                    if (hMeta) {
                        DWORD msgLen = 0;
                        EvtFormatMessage(hMeta, hEvent, 0, 0, nullptr,
                                        EvtFormatMessageEvent, 0, nullptr, &msgLen);
                        if (msgLen > 0) {
                            std::vector<wchar_t> msgBuf(msgLen + 1, 0);
                            if (EvtFormatMessage(hMeta, hEvent, 0, 0, nullptr,
                                                EvtFormatMessageEvent, msgLen,
                                                msgBuf.data(), &msgLen))
                                message = wideToUtf8(msgBuf.data());
                        }
                        EvtClose(hMeta);
                    }

                    // Fallback: at least report EventID
                    if (message.empty()) {
                        std::wstring evtId = extract(L"EventID");
                        message = "[EventID " + wideToUtf8(evtId.c_str()) + "]";
                    }

                    // Sanitise: collapse whitespace, truncate long messages
                    for (auto& c : message)
                        if (c == '\n' || c == '\r' || c == '\t') c = ' ';
                    if (message.size() > 250) message = message.substr(0, 250) + "...";

                    result.push_back(
                        "[" + wideToUtf8(channel) + "][" + levelLabel + "] " + message);
                }
            }
            EvtClose(hEvent);
            hEvent = nullptr;
        }
        EvtClose(hQuery);
    }
    return result;
}
#endif // _WIN32

json aggregateLogs(const std::vector<std::string> &logs,
                   std::unordered_map<std::string, LogStat> &store)
{
    time_t now = time(nullptr);
    for (const auto &log : logs) {
        std::string key = normalizeLog(log);
        if (store.find(key) == store.end())
            store[key] = {1, now, now};
        else {
            store[key].count++;
            store[key].lastSeen = now;
        }
    }
    json result = json::array();
    for (auto &it : store) {
        json entry;
        entry["message"]    = it.first;
        entry["count"]      = it.second.count;
        entry["first_seen"] = it.second.firstSeen;
        entry["last_seen"]  = it.second.lastSeen;
        result.push_back(entry);
    }
    return result;
}

// ════════════════════════════════════════════════════════════════
// NEW: Generate a stable hardware fingerprint for this machine.
//
// Windows: reads MachineGuid from registry (survives reboots,
//          unique per Windows installation)
// Linux:   reads /etc/machine-id (set once at OS install)
//
// We append the hostname so two VMs with cloned IDs still differ.
// ════════════════════════════════════════════════════════════════
std::string getFingerprint() {
    std::string raw = "";

#ifdef _WIN32
    // Read MachineGuid from Windows registry
    HKEY hKey;
    if (RegOpenKeyExA(HKEY_LOCAL_MACHINE,
                      "SOFTWARE\\Microsoft\\Cryptography",
                      0, KEY_READ | KEY_WOW64_64KEY, &hKey) == ERROR_SUCCESS)
    {
        char guid[256] = {};
        DWORD size = sizeof(guid);
        DWORD type = REG_SZ;
        RegQueryValueExA(hKey, "MachineGuid", nullptr, &type,
                         (LPBYTE)guid, &size);
        RegCloseKey(hKey);
        raw = std::string(guid);
    }
#else
    // Read /etc/machine-id on Linux
    std::ifstream f("/etc/machine-id");
    if (f.is_open()) std::getline(f, raw);
#endif

    // Append hostname so cloned VMs still get different fingerprints
    raw += "-" + getHostname();

    // Simple hash — good enough for a device identifier (not security)
    // We use std::hash which is fast and consistent within one build
    std::size_t h = std::hash<std::string>{}(raw);
    std::ostringstream oss;
    oss << std::hex << h;
    return oss.str();
}

// ════════════════════════════════════════════════════════════════
// NEW: Read config.json from the install directory.
// Returns a json object (may be empty if file doesn't exist).
// ════════════════════════════════════════════════════════════════
json readConfig() {
    std::ifstream f(CONFIG_PATH);
    if (!f.is_open()) return json::object();
    try {
        json cfg;
        f >> cfg;
        return cfg;
    } catch (...) {
        std::cerr << "Warning: config.json is invalid JSON, ignoring.\n";
        return json::object();
    }
}

// ════════════════════════════════════════════════════════════════
// NEW: Write config.json back to disk.
// Called once after credentials are received from backend.
// ════════════════════════════════════════════════════════════════
void writeConfig(const json &cfg) {
    // Make sure the directory exists
#ifdef _WIN32
    CreateDirectoryA(INSTALL_DIR.c_str(), NULL);
#else
    system(("mkdir -p " + INSTALL_DIR).c_str());
#endif
    std::ofstream f(CONFIG_PATH);
    if (f.is_open()) {
        f << cfg.dump(2);   // pretty-print with 2-space indent
        std::cout << "Config saved to " << CONFIG_PATH << "\n";
    } else {
        std::cerr << "ERROR: Could not write config to " << CONFIG_PATH << "\n";
    }
}

// ════════════════════════════════════════════════════════════════
// NEW: Provisioning loop.
//
// Called when agent starts with no systemId/systemKey.
// 1. Announces itself to backend (creates pending device record)
// 2. Polls /credentials every 10s until user claims on dashboard
// 3. Once claimed, saves credentials to config.json and returns them
//
// Returns true + fills sysId/sysKey when credentials received.
// Returns false if something went wrong fatally.
// ════════════════════════════════════════════════════════════════
bool runProvisioningLoop(const std::string &ingestUrl,
                         const std::string &fingerprint,
                         std::string &sysId,
                         std::string &sysKey)
{
    httplib::Client cli(ingestUrl.c_str());
    cli.set_connection_timeout(5, 0);
    cli.set_read_timeout(5, 0);

    std::string hostname = getHostname();

    // ── Step 1: Announce ────────────────────────────────────────
    std::cout << "\n[Provisioning] Announcing device to LogSphere...\n";
    std::cout << "[Provisioning] Hostname:    " << hostname    << "\n";
    std::cout << "[Provisioning] Fingerprint: " << fingerprint << "\n";

    json announceBody;
    announceBody["fingerprint"]   = fingerprint;
    announceBody["hostname"]      = hostname;
#ifdef _WIN32
    announceBody["platform"]      = "windows";
#else
    announceBody["platform"]      = "linux";
#endif
    announceBody["agentVersion"]  = "1.0.0";

    auto announceRes = cli.Post("/api/devices/announce",
                                announceBody.dump(),
                                "application/json");
    if (!announceRes) {
        std::cerr << "[Provisioning] ERROR: Could not reach backend at "
                  << ingestUrl << "\n";
        std::cerr << "[Provisioning] Check that LOGSPHERE_URL is correct.\n";
        return false;
    }

    std::cout << "[Provisioning] Device announced successfully!\n";
    std::cout << "[Provisioning] Please log into your LogSphere dashboard\n";
    std::cout << "[Provisioning] and click [Claim Device] for: "
              << hostname << "\n\n";

    // ── Step 2: Poll for credentials ────────────────────────────
    // Polls every 10 seconds, prints a dot so user knows it's alive
    int attempts = 0;
    while (true) {
        agentSleep(10);
        attempts++;

        // Print a waiting message every 6 attempts (1 minute)
        if (attempts % 6 == 0) {
            std::cout << "[Provisioning] Still waiting to be claimed... "
                      << "(" << (attempts * 10 / 60) << " min)\n";
        } else {
            std::cout << "." << std::flush;
        }

        auto credRes = cli.Get(
            ("/api/devices/credentials?fingerprint=" + fingerprint).c_str()
        );

        if (!credRes) continue; // network hiccup, try again

        if (credRes->status != 200) continue;

        try {
            json body = json::parse(credRes->body);
            std::string status = body.value("status", "");

            if (status == "pending") {
                continue; // not claimed yet, keep waiting
            }

            if (status == "claimed") {
                // ── Got credentials! ────────────────────────────
                sysId  = body["systemId"].get<std::string>();
                sysKey = body["systemKey"].get<std::string>();

                std::cout << "\n\n[Provisioning] Device claimed successfully!\n";
                std::cout << "[Provisioning] Monitoring will start now.\n\n";

                // Save to config.json so next startup skips provisioning
                json cfg = readConfig();
                cfg["systemId"]  = sysId;
                cfg["systemKey"] = sysKey;
                writeConfig(cfg);

                return true;
            }

            if (status == "already_delivered") {
                // Credentials were already delivered in a previous run
                // but config.json wasn't saved (crash/power cut).
                // Nothing we can do — user needs to re-claim.
                std::cerr << "[Provisioning] ERROR: Credentials already delivered "
                          << "but not found in config.json.\n";
                std::cerr << "[Provisioning] Please delete this device on the "
                          << "dashboard and re-install the agent.\n";
                return false;
            }

        } catch (...) {
            continue; // bad JSON, try again next poll
        }
    }
}

// ════════════════════════════════════════════════════════════════
// MAIN — updated flow
// ════════════════════════════════════════════════════════════════
int main() {
    std::string host       = getHostname();
    long        lastPos    = 0;
    int         heartbeat  = 0;
    std::unordered_map<std::string, LogStat> logStore;

    // ── Step 1: Read config.json ─────────────────────────────────
    json cfg = readConfig();

    std::string sysIdStr  = cfg.value("systemId",  "");
    std::string sysKeyStr = cfg.value("systemKey", "");
    std::string ingestUrl = cfg.value("ingestUrl", "http://localhost:5000");

    // Env vars still work as override (for Docker/systemd use)
    if (getenv("SYSTEM_ID"))    sysIdStr  = getenv("SYSTEM_ID");
    if (getenv("SYSTEM_KEY"))   sysKeyStr = getenv("SYSTEM_KEY");
    if (getenv("LOGSPHERE_URL")) ingestUrl = getenv("LOGSPHERE_URL");

    // ── Step 2: Provisioning if no credentials ───────────────────
    // This is the NEW part. If no systemId/systemKey found,
    // run the provisioning loop instead of crashing.
    if (sysIdStr.empty() || sysKeyStr.empty()) {
        std::string fingerprint = getFingerprint();

        bool ok = runProvisioningLoop(ingestUrl, fingerprint,
                                      sysIdStr, sysKeyStr);
        if (!ok) {
            std::cerr << "FATAL: Provisioning failed. Exiting.\n";
            return 1;
        }
    }

    // ── Step 3: Normal ingest loop ───────────────────────────────
    // Windows: reads from Windows Event Log (Application + System).
    // Linux:   tails a flat log file.
#ifndef _WIN32
    std::string logFilePath = "/var/log/syslog";
    if (getenv("LOG_FILE_PATH")) logFilePath = getenv("LOG_FILE_PATH");
    
    // Skip to end of log file on first run to avoid sending entire history
    {
        std::ifstream f(logFilePath, std::ios::ate);
        if (f.is_open()) {
            lastPos = f.tellg();
            std::cout << "[Agent] Skipping to end of " << logFilePath << " (pos " << lastPos << ")\n";
        }
    }
#endif

    httplib::Client cli(ingestUrl.c_str());
    cli.set_connection_timeout(5, 0);
    cli.set_read_timeout(5, 0);
    cli.set_write_timeout(5, 0);

    while (true) {
        heartbeat++;

        double cpu       = getCPUUsage();
        double mem       = getMemoryUsage();
        int    processes = getProcessCount();

#ifdef _WIN32
        auto newLogs = readWindowsEventLog(lastPos);
#else
        auto newLogs = readNewLogs(logFilePath, lastPos);
#endif
        auto aggregated = aggregateLogs(newLogs, logStore);

        std::cout << "CPU: " << cpu
                  << "% | Memory: " << mem
                  << "% | Processes: " << processes << "\n";

        json payload;
        payload["systemId"]   = sysIdStr;
        payload["systemKey"]  = sysKeyStr;
        payload["host"]       = host;
        payload["cpu"]        = cpu;
        payload["memory"]     = mem;
        payload["processes"]  = processes;
        payload["timestamp"]  = time(nullptr);

        if (!aggregated.empty())
            payload["logs"] = aggregated;

        if (heartbeat % 2 == 0 || !aggregated.empty()) {
            std::string data = payload.dump();
            std::cout << "Sending telemetry to " << ingestUrl << "/ingest ...\n";
            auto res = cli.Post("/ingest", data, "application/json");
            if (res) {
                if (res->status == 200)
                    std::cout << "Delivered successfully!\n";
                else
                    std::cerr << "Failed (Status: " << res->status << "): "
                              << res->body << "\n";
            } else {
                std::cerr << "HTTP Error: "
                          << httplib::to_string(res.error()) << "\n";
            }
        }

        if (!aggregated.empty()) logStore.clear();

        agentSleep(5);
    }

    return 0;
}