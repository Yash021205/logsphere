#!/bin/bash
set -e

INGEST_URL="https://api.logsphere.com"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --ingestUrl) INGEST_URL="$2"; shift 2 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
done

echo "Installing LogSphere Agent..."

INSTALL_DIR="/etc/logsphere"
AGENT_BIN="/usr/local/bin/logsphere-agent"

mkdir -p $INSTALL_DIR

# Download binary
curl -sLo $AGENT_BIN "$INGEST_URL/binaries/logsphere-agent-linux"
chmod +x $AGENT_BIN

# Write minimal config â€” no credentials
cat <<EOF > $INSTALL_DIR/config.json
{
  "ingestUrl": "$INGEST_URL"
}
EOF

# Systemd service â€” no credential env vars needed anymore
cat <<EOF > /etc/systemd/system/logsphere-agent.service
[Unit]
Description=LogSphere Telemetry Agent
After=network.target

[Service]
Type=simple
ExecStart=$AGENT_BIN
WorkingDirectory=$INSTALL_DIR
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable logsphere-agent.service
systemctl start logsphere-agent.service

echo ""
echo "Agent installed and running!"
echo "Log into your LogSphere dashboard and click [Claim Device] to begin monitoring."