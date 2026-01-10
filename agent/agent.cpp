#include <iostream>
#include <vector>
#include <fstream>
#include <algorithm>
#include <string>
#include <unistd.h>
#include <dirent.h>
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

int main() {
    long lastPos = 0;
    while(true) {
        double cpu = getCPUUsage();
        double mem = getMemoryUsage();
        int processes = getProcessCount();
        std::cout << "CPU: " << cpu << "%  |  Memory: " << mem << "%  |  Processes: " << processes << "\n";
auto logs = readNewLogs("app.log", lastPos);

for (auto &l : logs) {
    std::cout << "LOG: " << l << "\n";
}

        sleep(5);
    }
    return 0;
}
