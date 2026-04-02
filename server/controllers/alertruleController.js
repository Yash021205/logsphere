const AlertRule = require("../models/alertruleModel");

exports.getRules = async (req, res) => {
  let rule = await AlertRule.findOne(req.systemFilter);
  if (!rule && req.systemFilter.systemId && typeof req.systemFilter.systemId === "string") {
    rule = await AlertRule.create({ systemId: req.systemFilter.systemId });
  } else if (!rule) {
    return res.json(null);
  }
  res.json(rule);
};

exports.updateRules = async (req, res) => {
  let rule = await AlertRule.findOne(req.systemFilter);
  if (!rule && req.systemFilter.systemId && typeof req.systemFilter.systemId === "string") {
     rule = await AlertRule.create({ ...req.body, systemId: req.systemFilter.systemId });
  } else if (rule) {
    rule.cpuThreshold = req.body.cpuThreshold;
    rule.memoryThreshold = req.body.memoryThreshold;
    await rule.save();
  }
  res.json(rule);
};
