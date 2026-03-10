const express = require("express");
const router = express.Router();

const patientController = require("./patient.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","STAFF"),
  patientController.createPatient
);

router.get(
  "/",
  authMiddleware,
  patientController.getPatients
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","STAFF"),
  patientController.updatePatient
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  patientController.deletePatient
);

module.exports = router;