const AuditLog = require("../../models/auditLog.model");

exports.getLogs = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments();

  return {
    total,
    page,
    limit,
    data: logs
  };

};