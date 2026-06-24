param (
    [string]$ingestUrl = "https://api.logsphere.com"
)

# -- Directories ---------------------------------------------------
$InstallDir = "$env:ProgramData\LogSphere"
$AgentExe   = "$InstallDir\logsphere-agent.exe"
$ConfigFile = "$InstallDir\config.json"
$TaskName   = "LogSphereAgent"

# -- Require elevation ---------------------------------------------
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator."
    exit 1
}

Write-Host ""
Write-Host "  LogSphere Agent Installer" -ForegroundColor Cyan
Write-Host "  -------------------------"
Write-Host ""

# -- Create directory ----------------------------------------------
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
    Write-Host "  [+] Created $InstallDir"
}

# -- Download binary -----------------------------------------------
Write-Host "  [~] Downloading agent binary..."
try {
    Invoke-WebRequest -Uri "$ingestUrl/binaries/logsphere-agent-windows.exe" -OutFile $AgentExe -UseBasicParsing
    Write-Host "  [+] Binary saved to $AgentExe"
} catch {
    Write-Error "  [!] Failed to download agent: $_"
    exit 1
}

# -- Write minimal config ------------------------------------------
# No credentials here — agent self-provisions on first run.
if (-not (Test-Path $ConfigFile)) {
    $config = @{ ingestUrl = $ingestUrl } | ConvertTo-Json
    Set-Content -Path $ConfigFile -Value $config
    Write-Host "  [+] Config written to $ConfigFile"
} else {
    Write-Host "  [~] Config already exists, keeping existing credentials"
}

# -- Register as a Windows Scheduled Task -------------------------
Write-Host "  [~] Registering startup task..."

# Remove existing task if present (allows reinstall/upgrade)
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask  -TaskName $TaskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "  [~] Removed previous task"
}

$action    = New-ScheduledTaskAction -Execute $AgentExe -WorkingDirectory $InstallDir
$trigger   = New-ScheduledTaskTrigger -AtStartup
$settings  = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserID "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "LogSphere telemetry agent" -Force | Out-Null

Write-Host "  [+] Startup task registered (runs as SYSTEM, auto-restarts)"

# -- Start immediately ---------------------------------------------
Write-Host "  [~] Starting agent..."
Start-ScheduledTask -TaskName $TaskName
Start-Sleep -Seconds 2

$proc = Get-Process logsphere-agent -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "  [+] Agent is running! (PID: $($proc.Id))" -ForegroundColor Green
} else {
    Write-Host "  [!] Agent may not have started. Try running manually:" -ForegroundColor Yellow
    Write-Host "      & `"$AgentExe`""
}

Write-Host ""
Write-Host "  > Installation complete." -ForegroundColor Green
Write-Host ""
Write-Host "  Next step: log into your LogSphere dashboard and click"
Write-Host "  [Claim Device] - your machine will appear automatically."
Write-Host ""
Write-Host "  To stop:      Stop-ScheduledTask -TaskName $TaskName"
Write-Host "  To start:     Start-ScheduledTask -TaskName $TaskName"
Write-Host "  To uninstall: Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
Write-Host ""