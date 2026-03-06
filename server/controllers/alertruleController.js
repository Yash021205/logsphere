const AlertRule = require("../models/alertruleModel");

exports.getRules = async (req, res) => {
  let rule = await AlertRule.findOne();
  if (!rule) rule = await AlertRule.create({});
  res.json(rule);
};

exports.updateRules = async (req, res) => {
  let rule = await AlertRule.findOne();
  if (!rule) rule = await AlertRule.create(req.body);
  else {
    rule.cpuThreshold = req.body.cpuThreshold;
    rule.memoryThreshold = req.body.memoryThreshold;
    await rule.save();
  }
  res.json(rule);
};
