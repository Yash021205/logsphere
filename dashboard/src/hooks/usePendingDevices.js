import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";

export default function usePendingDevices() {
  const [devices,  setDevices]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [claiming, setClaiming] = useState(null); // deviceId being claimed

  const fetchPending = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/devices/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(res.data.devices || []);
      setError(null);
    } catch (err) {
      setError("Could not fetch pending devices");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch immediately on mount, then every 10 seconds
  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchPending]);

  const claimDevice = useCallback(async (deviceId) => {
  try {
    setClaiming(deviceId);
    const token = localStorage.getItem("token");
    await axios.post(`/api/devices/claim/${deviceId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Remove claimed device from list immediately
    setDevices(prev => prev.filter(d => d._id !== deviceId));
    // ── Force fresh JWT so new systemId takes effect ──────────
    // Reload the page — simplest and most reliable approach
    // JWT will be re-issued on next login, so redirect to auth
    alert("Device claimed! Please log in again to activate monitoring.");
    localStorage.removeItem("token");
    window.location.href = "/auth";

  } catch (err) {
    alert(err.response?.data?.error || "Failed to claim device");
  } finally {
    setClaiming(null);
  }
}, []);

  return { devices, loading, error, claimDevice, claiming };
}