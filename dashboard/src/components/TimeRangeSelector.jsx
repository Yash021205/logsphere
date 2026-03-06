function TimeRangeSelector({ range, setRange }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ marginRight: "10px" }}>Time Range:</label>
      <select value={range} onChange={e => setRange(e.target.value)}>
        <option value={5}>Last 5 mins</option>
        <option value={60}>Last 1 hour</option>
        <option value={1440}>Last 24 hours</option>
      </select>
    </div>
  );
}

export default TimeRangeSelector;