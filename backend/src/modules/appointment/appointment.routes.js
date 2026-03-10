const express = require("express");
const router = express.Router();

const appointmentController = require("./appointment.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","DOCTOR","STAFF"),
  appointmentController.createAppointment
);

router.get(
  "/",
  authMiddleware,
  appointmentController.getAppointments
);

router.get(
  "/doctor/:doctorId",
  authMiddleware,
  appointmentController.getDoctorAppointments
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN","DOCTOR"),
  appointmentController.updateAppointment
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  appointmentController.deleteAppointment
);

module.exports = router;