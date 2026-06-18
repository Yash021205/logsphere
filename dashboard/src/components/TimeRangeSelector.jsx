export default function TimeRangeSelector({ range, setRange }) {
  const opts = [
    { value: 5,    label: "5 min" },
    { value: 60,   label: "1 hour" },
    { value: 1440, label: "24 hrs" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,.04)", border: "1px solid var(--border)", borderRadius: "8px", padding: "3px" }}>
      {opts.map(o => (
        <button
          key={o.value}
          onClick={() => setRange(o.value)}
          style={{
            padding: "5px 12px",
            borderRadius: "6px",
            border: "none",
            background: range == o.value ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
            color: range == o.value ? "white" : "var(--muted)",
            fontSize: ".78rem",
            fontWeight: range == o.value ? "600" : "400",
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}