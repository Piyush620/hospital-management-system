const User = require("../../models/user.model");
const ApiError = require("../../errors/ApiError");

const { comparePassword, hashPassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt");

const { generateOtp } = require("../../utils/generateOtp");
const { sendOtpEmail } = require("../../services/email.service");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isDeleted: user.isDeleted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});


/*
Signup
*/
const signup = async (data) => {

  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const otp = generateOtp();

  const otpExpires = new Date(
    Date.now() + process.env.OTP_EXPIRY * 60000
  );

  const user = await User.create({
    ...data,
    password: hashedPassword,
    otp,
    otpExpires,
    isVerified: false   // 🔥 USER NOT VERIFIED YET
  });

  const emailResult = await sendOtpEmail(user.email, otp);
  if (!emailResult?.success) {
    throw new ApiError(
      502,
      `Failed to send OTP email: ${emailResult?.message || "Unknown email provider error"}`
    );
  }

  return {
    message: "Account created. Please verify OTP sent to your email."
  };
};



/*
Login
*/
const login = async (email, password) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email first");
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



/*
Verify OTP
*/
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
    message: "Email verified successfully"
  };
};



/*
Resend OTP
*/
const resendOtp = async (email) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User already verified");
  }

  // Generate new OTP
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + process.env.OTP_EXPIRY * 60000);

  // Update user with new OTP
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send OTP email
  const emailResult = await sendOtpEmail(user.email, otp);
  if (!emailResult?.success) {
    throw new ApiError(
      502,
      `Failed to send OTP email: ${emailResult?.message || "Unknown email provider error"}`
    );
  }

  return {
    message: "OTP resent to your email"
  };
};



module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  sanitizeUser
};
