const express = require("express");
const router = express.Router();

const hospitalController = require("./hospital.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

/*
Create Hospital
Only SUPER_ADMIN
*/

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  hospitalController.createHospital
);

/*
Get all hospitals
*/

router.get(
  "/",
  authMiddleware,
  hospitalController.getHospitals
);

/*
Get single hospital
*/

router.get(
  "/:id",
  authMiddleware,
  hospitalController.getHospital
);

/*
Update hospital
*/

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  hospitalController.updateHospital
);

/*
Delete hospital
*/

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  hospitalController.deleteHospital
);

module.exports = router;