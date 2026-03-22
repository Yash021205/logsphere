import { useEffect, useState } from "react";
import axios from "../api/axios";

function HealthCard() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const res = await axios.get("http://localhost:5000/health");
      setHealth(res.data);
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const color =
    health.status === "Healthy" ? "#065f46" :
    health.status === "Warning" ? "#78350f" :
    "#7f1d1d";

  return (
    <div style={{
      background: "#0f172a",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px",
      borderLeft: `6px solid ${color}`
    }}>
      <h2>System Health</h2>
      <h1>{health.score}/100</h1>
      <p>Status: {health.status}</p>
    </div>
  );
}

export default HealthCard;
