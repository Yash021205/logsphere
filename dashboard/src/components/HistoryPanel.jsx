import { useEffect, useState } from "react";
import axios from "../api/axios";

function HistoryPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/history")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return null;

  const formatChange = (c) => {
    const val = parseFloat(c);
    if (val > 0) return `🔺 +${c}%`;
    if (val < 0) return `🔻 ${c}%`;
    return `➡ 0%`;
  };

  return (
    <div style={{
      background: "#0f172a",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px"
    }}>
      <h2 style={{ marginBottom: "12px" }}>Historical Comparison</h2>

      <p>CPU: {data.cpu.today}% today vs {data.cpu.yesterday}% yesterday — {formatChange(data.cpu.change)}</p>
      <p>Memory: {data.memory.today}% today vs {data.memory.yesterday}% yesterday — {formatChange(data.memory.change)}</p>
    </div>
  );
}

export default HistoryPanel;
