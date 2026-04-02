#!/bin/bash
set -e

# Default to production if not set
INGEST_URL="https://api.logsphere.com"
SYSTEM_ID=""
SYSTEM_KEY=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --systemId) SYSTEM_ID="$2"; shift ;;
        --systemKey) SYSTEM_KEY="$2"; shift ;;
        --ingestUrl) INGEST_URL="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$SYSTEM_ID" ] || [ -z "$SYSTEM_KEY" ]; then
    echo "Error: --systemId and --systemKey are required."
    exit 1
fi

echo "Installing LogSphere Agent for System: $SYSTEM_ID..."

INSTALL_DIR="/usr/local/bin"
AGENT_BIN="$INSTALL_DIR/logsphere-agent"

# Download the native binary from the hosted location
echo "Downloading native binary..."
curl -sLo $AGENT_BIN "$INGEST_URL/binaries/logsphere-agent-linux"
chmod +x $AGENT_BIN

# Create systemd service
SERVICE_FILE="/etc/systemd/system/logsphere-agent.service"
echo "Registering background service at $SERVICE_FILE"

cat <<EOF > $SERVICE_FILE
[Unit]
Description=LogSphere Telemetry Agent
After=network.target

[Service]
Type=simple
ExecStart=$AGENT_BIN
Environment="SYSTEM_ID=$SYSTEM_ID"
Environment="SYSTEM_KEY=$SYSTEM_KEY"
Environment="LOGSPHERE_URL=$INGEST_URL"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable logsphere-agent.service
systemctl start logsphere-agent.service

echo "LogSphere Agent installed and started successfully!"
