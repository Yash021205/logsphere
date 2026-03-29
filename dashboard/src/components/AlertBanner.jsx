import { useState, useEffect } from "react";
import axios from "../api/axios";

function AlertBanner({ systemId }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = () => {
      axios.get(`/alerts?${systemId ? `systemId=${systemId}` : ''}`)
        .then(res => {
          setAlerts(res.data.slice(0, 2));
        })
        .catch(err => console.error(err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [systemId]);

  if (alerts.length === 0) return null;

  return (
    <div style={{
      width: "100%",
      marginBottom: "15px",
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }}>
      {alerts.map((alert, index) => {
        const bgColor =
          alert.level === "CRITICAL" ? "#7f1d1d" :
          alert.level === "WARNING" ? "#78350f" :
          "#064e3b";

        return (
          <div key={index} style={{
            padding: "8px 14px",
            borderRadius: "6px",
            background: bgColor,
            color: "white",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span>🚨 {alert.type} — {alert.message}</span>
            <span style={{ fontWeight: "bold" }}>{alert.level}</span>
          </div>
        );
      })}
    </div>
  );
}

export default AlertBanner;



