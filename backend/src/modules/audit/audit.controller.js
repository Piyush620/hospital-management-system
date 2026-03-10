const auditService = require("./audit.service");

exports.getLogs = async (req, res, next) => {

  try {

    const result = await auditService.getLogs(req.query);

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }

};