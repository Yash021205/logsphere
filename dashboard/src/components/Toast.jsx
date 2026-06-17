// dashboard/src/components/Toast.jsx
import React from "react";

const COLORS = {
  success: { bg: "rgba(22,163,74,0.15)",  border: "#16a34a", icon: "✓", text: "#22c55e" },
  error:   { bg: "rgba(220,38,38,0.15)",  border: "#dc2626", icon: "✕", text: "#ef4444" },
  info:    { bg: "rgba(99,102,241,0.15)", border: "#6366f1", icon: "ℹ", text: "#818cf8" },
  warning: { bg: "rgba(245,158,11,0.15)", border: "#d97706", icon: "⚠", text: "#f59e0b" },
};

function ToastItem({ toast, onDismiss }) {
  const c = COLORS[toast.type] || COLORS.info;
  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "10px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        cursor: "pointer",
        animation: "toastSlideIn 0.25s ease",
        maxWidth: "360px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      }}
    >
      <span style={{ color: c.text, fontWeight: "700", fontSize: "1rem", flexShrink: 0 }}>
        {c.icon}
      </span>
      <span style={{ color: "#e2e8f0", fontSize: "0.88rem", lineHeight: "1.5" }}>
        {toast.message}
      </span>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999,
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}
