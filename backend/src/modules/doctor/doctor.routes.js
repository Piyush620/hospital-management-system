const express = require("express");
const router = express.Router();

const doctorController = require("./doctor.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

/*
Create Doctor
*/

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  doctorController.createDoctor
);

/*
Get Doctors
*/

router.get(
  "/",
  authMiddleware,
  doctorController.getDoctors
);

/*
Update Doctor
*/

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  doctorController.updateDoctor
);

/*
Delete Doctor
*/

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  doctorController.deleteDoctor
);

module.exports = router;