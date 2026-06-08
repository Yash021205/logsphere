param (
    [string]$ingestUrl = "https://api.logsphere.com"
)

$InstallDir = "$env:LOCALAPPDATA\LogSphere"
$AgentExe   = "$InstallDir\logsphere-agent.exe"
$ConfigFile = "$InstallDir\config.json"

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
}

Write-Host "Installing LogSphere Agent..."

# Download the binary
Invoke-WebRequest -Uri "$ingestUrl/binaries/logsphere-agent-windows.exe" `
                  -OutFile $AgentExe

# Write minimal config — no credentials, agent provisions itself
$config = @{ ingestUrl = $ingestUrl } | ConvertTo-Json
Set-Content -Path $ConfigFile -Value $config

Write-Host "Config written to $ConfigFile"
Write-Host "Starting agent..."
Start-Process -FilePath $AgentExe -WorkingDirectory $InstallDir

Write-Host ""
Write-Host "Agent is running! Please log into your LogSphere dashboard"
Write-Host "and click [Claim Device] to begin monitoring."