const express = require("express");
const router = express.Router();

const paymentController = require("./payment.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","STAFF"),
  paymentController.createPayment
);

router.get(
  "/",
  authMiddleware,
  paymentController.getPayments
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  paymentController.updatePayment
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  paymentController.deletePayment
);

module.exports = router;