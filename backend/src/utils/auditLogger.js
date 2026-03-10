const AuditLog = require("../models/auditLog.model");

const logAction = async (
  userId,
  action,
  module,
  entityId = null,
  metadata = {}
) => {
  try {

    // If no userId, skip logging
    if (!userId) {
      console.warn("Audit log skipped: userId missing");
      return;
    }

    await AuditLog.create({
      user: userId,
      action,
      module,
      entityId,
      metadata
    });

  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = { logAction };