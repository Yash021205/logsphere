const AlertRule = require("../models/alertruleModel");

exports.getRules = async (req, res) => {
  const systemId = req.systemId;
  let rule = await AlertRule.findOne({ systemId });
  if (!rule) rule = await AlertRule.create({ systemId });
  res.json(rule);
};

exports.updateRules = async (req, res) => {
  const systemId = req.systemId;
  let rule = await AlertRule.findOne({ systemId });
  if (!rule) rule = await AlertRule.create({ ...req.body, systemId });
  else {
    rule.cpuThreshold = req.body.cpuThreshold;
    rule.memoryThreshold = req.body.memoryThreshold;
    await rule.save();
  }
  res.json(rule);
};
