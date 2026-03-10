const express = require("express");
const router = express.Router();

const roomController = require("./room.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");


router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  roomController.createRoom
);


router.get(
  "/",
  authMiddleware,
  roomController.getRooms
);


router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN","HOSPITAL_ADMIN"),
  roomController.updateRoom
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  roomController.deleteRoom
);

module.exports = router;