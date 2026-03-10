const express = require("express");
const router = express.Router();

const bedController = require("./bed.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  bedController.createBed
);

router.get(
  "/",
  authMiddleware,
  bedController.getBeds
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  bedController.updateBed
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  bedController.deleteBed
);

module.exports = router;