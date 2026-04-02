const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send("No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.systemId = decoded.systemId;
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.email = decoded.email;

    if (req.role === "Admin" && req.email) {
      const clients = await User.find({ adminEmail: req.email, role: "Client" });
      const systemIds = clients.map(c => c.systemId).filter(id => id);
      
      if (req.systemId) {
        systemIds.push(req.systemId);
      }
      
      const requestedSystemId = req.query.systemId || (req.body && req.body.systemId);
      
      if (requestedSystemId) {
        if (systemIds.includes(requestedSystemId)) {
          req.systemFilter = { systemId: requestedSystemId };
        } else {
          req.systemFilter = { systemId: "unauthorized_system_id" };
        }
      } else {
        req.systemFilter = { systemId: { $in: systemIds } };
      }
    } else {
      req.systemFilter = { systemId: req.systemId };
    }

    next();

  } catch (err) {

    return res.status(401).send("Invalid token");

  }

};

module.exports = authMiddleware;