const AlertRule = require("../models/alertruleModel");

exports.checkAlerts = async (data) => {
  const rule = await AlertRule.findOne();

  if (!rule) {
    console.log(" No alert rule found in DB");
    return [];
  }
  const alerts = [];

  if (data.cpu > rule.cpuThreshold) {
    alerts.push({
      type: "CPU",
      message: "CPU usage above threshold",
      level: data.cpu > rule.cpuThreshold + 10 ? "CRITICAL" : "WARNING"
    });
  }

  if (data.memory > rule.memoryThreshold) {
    alerts.push({
      type: "Memory",
      message: "Memory usage above threshold",
      level: data.memory > rule.memoryThreshold + 10 ? "CRITICAL" : "WARNING"
    });
  }

  return alerts;
};

