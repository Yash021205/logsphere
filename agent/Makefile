# LogSphere Agent — Build Script
#
# Targets:
#   make windows   — build logsphere-agent-windows.exe (requires MinGW UCRT64 on PATH)
#   make linux     — cross-compile for Linux x86-64 (requires x86_64-linux-gnu-g++)
#   make all       — build both (default)
#   make deploy    — copy binaries into ../server/public/binaries/
#   make clean     — remove build artifacts

CXX_WIN   = C:/msys64/ucrt64/bin/g++.exe
CXX_LINUX = x86_64-linux-gnu-g++    # apt install gcc-mingw-w64  /  g++-x86-64-linux-gnu

CXXFLAGS  = -std=c++17 -O2
WIN_FLAGS = -D_WIN32_WINNT=0x0A00 -lws2_32 -lpsapi
LIN_FLAGS = -lpthread -static-libstdc++ -static-libgcc

WIN_OUT   = logsphere-agent-windows.exe
LIN_OUT   = logsphere-agent-linux
SRC       = agent.cpp
DEPLOY    = ../server/public/binaries

.PHONY: all windows linux deploy clean

all: windows linux

windows:
	$(CXX_WIN) $(CXXFLAGS) $(WIN_FLAGS) $(SRC) -o $(WIN_OUT)
	@echo "Windows binary: $(WIN_OUT)"

linux:
	$(CXX_LINUX) $(CXXFLAGS) $(LIN_FLAGS) $(SRC) -o $(LIN_OUT)
	@echo "Linux binary: $(LIN_OUT)"

deploy: all
	mkdir -p $(DEPLOY)
	cp $(WIN_OUT) $(DEPLOY)/$(WIN_OUT)
	cp $(LIN_OUT) $(DEPLOY)/$(LIN_OUT)
	@echo "Binaries deployed to $(DEPLOY)"

clean:
	rm -f $(WIN_OUT) $(LIN_OUT)
