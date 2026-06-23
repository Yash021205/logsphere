const AlertRule = require("../models/alertruleModel");

// Extract a concrete systemId string from whichever filter shape we get
function extractSystemId(filter) {
  if (!filter || !filter.systemId) return null;
  if (typeof filter.systemId === "string") return filter.systemId;
  if (Array.isArray(filter.systemId?.$in)) return filter.systemId.$in[0] || null;
  return null;
}

exports.getRules = async (req, res) => {
  const sid = extractSystemId(req.systemFilter);
  if (!sid) return res.json(null);

  // findOneAndUpdate with upsert = find-or-create in one atomic operation
  const rule = await AlertRule.findOneAndUpdate(
    { systemId: sid },
    { $setOnInsert: { cpuThreshold: 80, memoryThreshold: 85 } },
    { upsert: true, new: true }
  );
  res.json(rule);
};

exports.updateRules = async (req, res) => {
  const sid = extractSystemId(req.systemFilter);
  if (!sid) return res.status(400).json({ error: "No system selected" });

  const rule = await AlertRule.findOneAndUpdate(
    { systemId: sid },
    { $set: { cpuThreshold: req.body.cpuThreshold, memoryThreshold: req.body.memoryThreshold } },
    { upsert: true, new: true }
  );
  res.json(rule);
};
