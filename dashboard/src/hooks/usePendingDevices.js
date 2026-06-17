import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";

// showToast is passed in by the parent so this hook stays testable
// without needing a global store.
export default function usePendingDevices({ showToast } = {}) {
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
    return () => clearInterval(interval);
  }, [fetchPending]);

  const claimDevice = useCallback(async (deviceId) => {
    try {
      setClaiming(deviceId);
      const token = localStorage.getItem("token");

      // Step 1: claim the device
      await axios.post(`/api/devices/claim/${deviceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Step 2: get a fresh JWT that carries the new systemId
      const refreshRes = await axios.post("/auth/refresh", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem("token", refreshRes.data.token);

      // Step 3: remove from pending list optimistically
      setDevices(prev => prev.filter(d => d._id !== deviceId));

      // Step 4: show success toast (no forced logout!)
      if (showToast) {
        showToast(
          "Device claimed! Monitoring is now active — the dashboard will update automatically.",
          "success",
          6000
        );
      }

      // Soft-reload the page so all components re-read the new JWT from localStorage
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      const msg = err.response?.data?.error || "Failed to claim device";
      if (showToast) showToast(msg, "error");
      else alert(msg);
    } finally {
      setClaiming(null);
    }
  }, [showToast]);

  return { devices, loading, error, claimDevice, claiming };
}