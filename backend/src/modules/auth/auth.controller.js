const authService = require("./auth.service");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const { generateAccessToken } = require("../../utils/jwt");

const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, and password are required"
      });
    }

    const validRoles = ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "STAFF"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`
      });
    }

    const result = await authService.signup(req.body);

    res.json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyOtp(email, otp);
    const updatedUser = await User.findOne({ email });

    res.json({
      success: true,
      message: result.message,
      data: {
        user: authService.sanitizeUser(updatedUser)
      }
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      message: "Access token refreshed",
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const result = await authService.resendOtp(email);

    res.json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  verifyOtp,
  refreshToken,
  resendOtp
};
