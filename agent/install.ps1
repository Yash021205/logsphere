param (
    [string]$ingestUrl = "https://api.logsphere.com"
)

# ── Directories ───────────────────────────────────────────────────
# Exe in ProgramFiles (read-only to non-admins; safe from tampering)
# Config in ProgramData  (machine-wide; accessible by SYSTEM account)
$BinDir     = "$env:ProgramFiles\LogSphere"
$ConfigDir  = "$env:ProgramData\LogSphere"
$AgentExe   = "$BinDir\logsphere-agent.exe"
$ConfigFile = "$ConfigDir\config.json"
$TaskName   = "LogSphereAgent"

# ── Require elevation ─────────────────────────────────────────────
if (-not ([Security.Principal.WindowsPrincipal] `
          [Security.Principal.WindowsIdentity]::GetCurrent()
         ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator."
    exit 1
}

Write-Host ""
Write-Host "  LogSphere Agent Installer" -ForegroundColor Cyan
Write-Host "  ─────────────────────────"
Write-Host ""

# ── Create directories ────────────────────────────────────────────
foreach ($dir in @($BinDir, $ConfigDir)) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "  [+] Created $dir"
    }
}

# ── Protect config directory ──────────────────────────────────────
# Only SYSTEM and Administrators can read/write.
# Regular users cannot access credentials.
icacls $ConfigDir /inheritance:r `
    /grant "SYSTEM:(OI)(CI)F" `
    /grant "Administrators:(OI)(CI)F" | Out-Null
Write-Host "  [+] Config directory permissions locked down"

# ── Download binary ───────────────────────────────────────────────
Write-Host "  [~] Downloading agent binary..."
try {
    Invoke-WebRequest -Uri "$ingestUrl/binaries/logsphere-agent-windows.exe" `
                      -OutFile $AgentExe -UseBasicParsing
    Write-Host "  [+] Binary saved to $AgentExe"
} catch {
    Write-Error "  [!] Failed to download agent: $_"
    exit 1
}

# ── Write minimal config ──────────────────────────────────────────
# No credentials here — agent self-provisions on first run.
$config = @{ ingestUrl = $ingestUrl } | ConvertTo-Json
Set-Content -Path $ConfigFile -Value $config
Write-Host "  [+] Config written to $ConfigFile"

# ── Register as a Windows Scheduled Task ─────────────────────────
# Runs as SYSTEM at every system startup; restarts up to 3× on failure.
# Does NOT require the agent to implement the Windows Service protocol.
Write-Host "  [~] Registering startup task..."

# Remove existing task if present (allows reinstall/upgrade)
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask  -TaskName $TaskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "  [~] Removed previous task"
}

$action    = New-ScheduledTaskAction `
                 -Execute $AgentExe `
                 -WorkingDirectory $ConfigDir   # agent reads config from WorkingDir

$trigger   = New-ScheduledTaskTrigger -AtStartup

$settings  = New-ScheduledTaskSettingsSet `
                 -RestartCount 3 `
                 -RestartInterval (New-TimeSpan -Minutes 1) `
                 -StartWhenAvailable $true `
                 -ExecutionTimeLimit ([TimeSpan]::Zero)   # no timeout

$principal = New-ScheduledTaskPrincipal `
                 -UserID "SYSTEM" `
                 -LogonType ServiceAccount `
                 -RunLevel Highest

Register-ScheduledTask `
    -TaskName   $TaskName `
    -Action     $action `
    -Trigger    $trigger `
    -Settings   $settings `
    -Principal  $principal `
    -Description "LogSphere telemetry agent — monitors CPU, memory and Windows Event Log" `
    -Force | Out-Null

Write-Host "  [+] Startup task registered (runs as SYSTEM, auto-restarts)"

# ── Start immediately ─────────────────────────────────────────────
Write-Host "  [~] Starting agent..."
Start-ScheduledTask -TaskName $TaskName
Write-Host "  [+] Agent is running!"

Write-Host ""
Write-Host "  ✓ Installation complete." -ForegroundColor Green
Write-Host ""
Write-Host "  Next step: log into your LogSphere dashboard and click"
Write-Host "  [Claim Device] — your machine will appear automatically."
Write-Host ""
Write-Host "  To stop the agent:    Stop-ScheduledTask  -TaskName $TaskName"
Write-Host "  To uninstall:         Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
Write-Host ""