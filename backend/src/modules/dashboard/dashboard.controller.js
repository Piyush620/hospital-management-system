const dashboardService = require("./dashboard.service");

exports.getStats = async (req, res, next) => {

  try {

    const stats = await dashboardService.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (err) {
    next(err);
  }

};

exports.getAdmissionsTrend = async (req, res, next) => {
  try {
    const trend = await dashboardService.getAdmissionsTrend();

    res.json({
      success: true,
      data: trend
    });
  } catch (err) {
    next(err);
  }
};