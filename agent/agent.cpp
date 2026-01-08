#include <iostream>
#include <fstream>
#include <string>
#include <unistd.h>

double getCPUUsage() {
    std::ifstream file("/proc/stat");
    std::string cpu;
    long user, nice, system, idle;

    file >> cpu >> user >> nice >> system >> idle;
    long total = user + nice + system + idle;

    return (double)(total - idle) / total * 100.0;
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


int main() {
    while(true) {
        double cpu = getCPUUsage();
        double mem = getMemoryUsage();
        std::cout << "CPU Usage: " << cpu << "% | Memory: "<< mem <<"%\n";
        sleep(5);
    }
    return 0;
}
