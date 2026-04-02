param (
    [Parameter(Mandatory=$true)][string]$systemId,
    [Parameter(Mandatory=$true)][string]$systemKey,
    [string]$ingestUrl = "https://api.logsphere.com"
)

$InstallDir = "C:\Program Files\LogSphere"
$AgentExe = "$InstallDir\logsphere-agent.exe"
$ConfigFile = "$InstallDir\config.json"

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
}

Write-Host "Installing LogSphere Agent for System: $systemId..."

# Download the compiled windows executable
Write-Host "Downloading native binary..."
Invoke-WebRequest -Uri "$ingestUrl/binaries/logsphere-agent-windows.exe" -OutFile $AgentExe

# Write config.json so the C++ agent can read credentials on startup
$config = @{
    systemId  = $systemId
    systemKey = $systemKey
    ingestUrl = $ingestUrl
} | ConvertTo-Json

Set-Content -Path $ConfigFile -Value $config
Write-Host "Configuration written to $ConfigFile"

# Register as a Windows Service using NSSM (recommended) or sc.exe
# NSSM allows passing environment variables and working directories cleanly.
# Download NSSM: https://nssm.cc/download
# nssm install LogSphereAgent "$AgentExe"
# nssm set LogSphereAgent AppDirectory "$InstallDir"
# nssm start LogSphereAgent

# Fallback: register with sc.exe (requires the binary to implement Win32 Service APIs)
# sc.exe create LogSphereAgent binPath="$AgentExe" start=auto
# sc.exe start LogSphereAgent

Write-Host "LogSphere Agent installed successfully!"
Write-Host "To start the agent, run: $AgentExe"
