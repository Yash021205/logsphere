exports.classifyLog = (msg) => {
  const text = msg.toLowerCase();

  if (text.includes("error")) return "Error";
  if (text.includes("warning")) return "Warning";
  if (text.includes("timeout") || text.includes("network")) return "Network";
  if (text.includes("memory")) return "Resource";
  return "Info";
};
