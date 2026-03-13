const User = require("../../models/user.model");
const ApiError = require("../../errors/ApiError");

const { comparePassword, hashPassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt");
const { generateOtp } = require("../../utils/generateOtp");
const { sendOtpToPhone } = require("../../services/email.service");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  isDeleted: user.isDeleted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const createOtpExpiry = () => new Date(Date.now() + process.env.OTP_EXPIRY * 60000);

const signup = async (data) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { phone: data.phone }]
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new ApiError(400, "User already exists with this email");
    }

    throw new ApiError(400, "User already exists with this phone number");
  }

  const hashedPassword = await hashPassword(data.password);
  const otp = generateOtp();
  const otpExpires = createOtpExpiry();

  const user = await User.create({
    ...data,
    password: hashedPassword,
    otp,
    otpExpires,
    isVerified: false
  });

  const smsResult = await sendOtpToPhone(user.phone, otp);

  if (!smsResult?.success) {
    throw new ApiError(
      502,
      `Failed to send SMS OTP: ${smsResult?.message || "Unknown SMS provider error"}`
    );
  }

  return {
    message: "Account created. Please verify the OTP sent to your phone."
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your phone number first");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};

const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.otp || String(user.otp) !== String(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (new Date(user.otpExpires) < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  return {
    message: "Phone verified successfully"
  };
};

const resendOtp = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User already verified");
  }

  const otp = generateOtp();
  const otpExpires = createOtpExpiry();

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  const smsResult = await sendOtpToPhone(user.phone, otp);

  if (!smsResult?.success) {
    throw new ApiError(
      502,
      `Failed to send SMS OTP: ${smsResult?.message || "Unknown SMS provider error"}`
    );
  }

  return {
    message: "OTP resent to your phone"
  };
};

module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  sanitizeUser
};
