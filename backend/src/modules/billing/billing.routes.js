const express = require("express");
const router = express.Router();

const billingController = require("./billing.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","STAFF"),
  billingController.createBill
);

router.get(
  "/",
  authMiddleware,
  billingController.getBills
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  billingController.updateBill
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  billingController.deleteBill
);

module.exports = router;