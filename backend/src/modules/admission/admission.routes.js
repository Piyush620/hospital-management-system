const express = require("express");
const router = express.Router();

const admissionController = require("./admission.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","DOCTOR"),
  admissionController.createAdmission
);


router.get(
  "/",
  authMiddleware,
  admissionController.getAdmissions
);


router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","DOCTOR"),
  admissionController.updateAdmission
);


router.post(
  "/discharge/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","DOCTOR"),
  admissionController.dischargePatient
);

module.exports = router;