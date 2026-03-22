import { useEffect, useState } from "react";
import axios from "../api/axios";

function ForecastPanel() {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      const res = await axios.get("http://localhost:5000/predict");
      setForecast(res.data);
    };

    fetchForecast();
    const interval = setInterval(fetchForecast, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!forecast) return null;

  return (
    <div style={{
      background: "#0f172a",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px"
    }}>
      <h2>🔮 Load Forecast</h2>
      <p>CPU may reach 90% in: {forecast.cpuPrediction}</p>
      <p>Memory may reach 90% in: {forecast.memPrediction}</p>
    </div>
  );
}

export default ForecastPanel;
