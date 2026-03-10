const express = require("express");
const router = express.Router();

const departmentController = require("./department.controller");
const dashboardController = require("../dashboard/dashboard.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  departmentController.createDepartment
);

router.get(
  "/",
  authMiddleware,
  departmentController.getDepartments
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  dashboardController.getStats
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  departmentController.updateDepartment
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  departmentController.deleteDepartment
);

module.exports = router;