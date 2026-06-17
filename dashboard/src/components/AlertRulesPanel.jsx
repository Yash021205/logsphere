// dashboard/src/components/AlertRulesPanel.jsx
//
// Lets users view and update their CPU and Memory alert thresholds.
// Talks to GET/PUT /alert-rules (already fully implemented on the server).

import React, { useEffect, useState } from "react";
import axios from "../api/axios";

function SliderInput({ label, value, onChange, unit = "%" }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ color: "#cbd5e1", fontSize: "0.9rem", fontWeight: "500" }}>{label}</span>
        <span style={{
          color: value >= 90 ? "#ef4444" : value >= 75 ? "#f59e0b" : "#22c55e",
          fontWeight: "700",
          fontSize: "1rem"
        }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min={10}
          max={99}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "0.72rem", color: "#475569", marginTop: "4px"
        }}>
          <span>10%</span>
          <span style={{ color: "#22c55e" }}>Safe (&lt;75%)</span>
          <span style={{ color: "#f59e0b" }}>Warning (75–89%)</span>
          <span style={{ color: "#ef4444" }}>Critical (≥90%)</span>
          <span>99%</span>
        </div>
      </div>
    </div>
  );
}

export default function AlertRulesPanel({ systemId }) {
  const [cpuThreshold,    setCpuThreshold]    = useState(80);
  const [memoryThreshold, setMemoryThreshold] = useState(85);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState(null);

  // Load current rules
  useEffect(() => {
    if (!systemId) return;
    const token = localStorage.getItem("token");
    axios
      .get(`/alert-rules${systemId ? `?systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data) {
          setCpuThreshold(res.data.cpuThreshold    ?? 80);
          setMemoryThreshold(res.data.memoryThreshold ?? 85);
        }
      })
      .catch(() => setError("Could not load alert rules"))
      .finally(() => setLoading(false));
  }, [systemId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("token");
      await axios.put(
        `/alert-rules${systemId ? `?systemId=${systemId}` : ""}`,
        { cpuThreshold, memoryThreshold },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.5)",
      borderRadius: "16px",
      padding: "32px 36px",
      border: "1px solid #1e293b",
      maxWidth: "560px",
      marginTop: "24px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span style={{ fontSize: "1.4rem" }}>🔔</span>
        <h2 style={{ margin: 0, color: "#6366f1", fontSize: "1.2rem" }}>Alert Thresholds</h2>
      </div>
      <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "28px" }}>
        An alert fires when CPU or memory stays above these values. Tune to reduce false positives.
      </p>

      {loading ? (
        <p style={{ color: "#475569" }}>Loading rules…</p>
      ) : (
        <>
          <SliderInput
            label="CPU Alert Threshold"
            value={cpuThreshold}
            onChange={setCpuThreshold}
          />
          <SliderInput
            label="Memory Alert Threshold"
            value={memoryThreshold}
            onChange={setMemoryThreshold}
          />

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: saved
                ? "linear-gradient(135deg, #16a34a, #15803d)"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Alert Rules"}
          </button>
        </>
      )}
    </div>
  );
}
