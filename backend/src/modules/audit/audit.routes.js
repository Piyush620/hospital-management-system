const express = require("express");

const router = express.Router();

const auditController = require("./audit.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditController.getLogs
);

module.exports = router;