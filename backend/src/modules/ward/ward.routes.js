const express = require("express");
const router = express.Router();

const wardController = require("./ward.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  wardController.createWard
);


router.get(
  "/",
  authMiddleware,
  wardController.getWards
);


router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  wardController.updateWard
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  wardController.deleteWard
);

module.exports = router;