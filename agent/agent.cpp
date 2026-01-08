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

int main() {
    while(true) {
        double cpu = getCPUUsage();
        std::cout << "CPU Usage: " << cpu << "%\n";
        sleep(5);
    }
    return 0;
}
