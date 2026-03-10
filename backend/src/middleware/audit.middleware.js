const AuditLog = require("../models/auditLog.model");

const auditLogger = (moduleName, action) => {
  return async (req, res, next) => {

    try {

      if (!req.user) {
        return next();
      }

      await AuditLog.create({
        userId: req.user.id,
        module: moduleName,
        action: action,
        ipAddress: req.ip
      });

    } catch (error) {
      console.log("Audit log error:", error.message);
    }

    next();
  };
};

module.exports = auditLogger;