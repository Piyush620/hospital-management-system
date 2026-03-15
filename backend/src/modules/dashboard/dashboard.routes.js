const express = require("express");

const router = express.Router();

const dashboardController = require("./dashboard.controller");

const authMiddleware = require("../../middleware/auth.middleware");

const roleMiddleware = require("../../middleware/role.middleware");


router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "STAFF"),
  dashboardController.getStats
);

router.get(
  "/admissions-trend",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "STAFF"),
  dashboardController.getAdmissionsTrend
);

module.exports = router;