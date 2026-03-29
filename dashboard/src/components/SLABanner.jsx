import { useEffect, useState } from "react";
import axios from "../api/axios";

function SLABanner({ systemId }) {
  const [sla, setSla] = useState(null);

  useEffect(() => {
    const fetchSLA = async () => {
      const res = await axios.get(`/sla?${systemId ? `systemId=${systemId}` : ''}`);
      setSla(res.data);
    };

    fetchSLA();
    const interval = setInterval(fetchSLA, 10000);
    return () => clearInterval(interval);
  }, [systemId]);

  if (!sla || !sla.violation) return null;

  return (
    <div style={{
      background:"#7f1d1d",
      padding:"10px",
      borderRadius:"6px",
      marginBottom:"15px",
      color:"white"
    }}>
      🚨 SLA VIOLATION — {sla.reason}
    </div>
  );
}

export default SLABanner;
