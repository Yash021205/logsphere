import { useEffect, useState } from "react";
import { socket } from "../socket";

function AnomalyBanner() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.on("anomaly", (data) => {
      setAlerts(data);
      setTimeout(() => setAlerts([]), 7000);
    });

    return () => socket.off("anomaly");
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: "10px" }}>
      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            background: "#3f3f0a",
            color: "#facc15",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "6px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "500"
          }}
        >
          <span>
            ⚠ {a.type} anomaly — {a.message}
          </span>

          <span style={{ fontSize: "12px", opacity: 0.8 }}>
            ANOMALY
          </span>
        </div>
      ))}
    </div>
  );
}

export default AnomalyBanner;


