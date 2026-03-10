const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/refresh-token", authController.refreshToken);
module.exports = router;