const User = require("../../models/user.model");
const ApiError = require("../../errors/ApiError");
const { admin, firebaseConfigError, isFirebaseConfigured } = require("../../config/firebase");

const { comparePassword, hashPassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt");
const { sendOtpToEmail } = require("../../services/email.service");
const { generateOtp, verifyOtpCode } = require("../../services/otp.service");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  firebaseUid: user.firebaseUid || null,
  isVerified: user.isVerified,
  isDeleted: user.isDeleted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const normalizePhone = (phone) => {
  const trimmed = String(phone || "").trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  return `+${trimmed.replace(/\D/g, "")}`;
};

const verifyFirebasePhoneToken = async (firebaseIdToken, expectedPhone) => {
  if (!isFirebaseConfigured()) {
    throw new ApiError(
      503,
      `Firebase Admin SDK is not configured on the backend${firebaseConfigError ? `: ${firebaseConfigError}` : ""}`
    );
  }

  if (!firebaseIdToken) {
    throw new ApiError(400, "Firebase verification token is required");
  }

  let decodedToken;

  try {
    decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
  } catch (error) {
    throw new ApiError(401, "Invalid Firebase verification token");
  }

  if (!decodedToken.phone_number) {
    throw new ApiError(400, "Firebase token does not contain a verified phone number");
  }

  const normalizedTokenPhone = normalizePhone(decodedToken.phone_number);
  const normalizedExpectedPhone = normalizePhone(expectedPhone);

  if (normalizedExpectedPhone && normalizedTokenPhone !== normalizedExpectedPhone) {
    throw new ApiError(400, "Verified Firebase phone number does not match the signup phone number");
  }

  return {
    firebaseUid: decodedToken.uid,
    phoneNumber: normalizedTokenPhone
  };
};

const signup = async (data) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    email: data.email
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  // Generate OTP for email verification
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + (Number(process.env.OTP_EXPIRY || 5) * 60 * 1000));

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    role: data.role,
    password: hashedPassword,
    otp: otp,
    otpExpires: otpExpires,
    isVerified: false, // Will be verified after OTP confirmation
    firebaseUid: null // Not using Firebase for now
  });

  // Send OTP via email
  const emailResult = await sendOtpToEmail(data.email, otp);

  if (!emailResult.success) {
    // If email fails, delete the user and throw error
    await User.findByIdAndDelete(user._id);
    throw new ApiError(500, `Failed to send verification email: ${emailResult.message}`);
  }

  return {
    message: "Account created successfully. Please check your email for verification code.",
    user: sanitizeUser(user),
    otpSent: true,
    expiresIn: `${process.env.OTP_EXPIRY || 5} minutes`
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email address first");
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

  if (!user.otp || !user.otpExpires) {
    throw new ApiError(400, "No OTP found. Please request a new one.");
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  const isValidOtp = verifyOtpCode(otp, user.otp);

  if (!isValidOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Mark user as verified and clear OTP
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  user.emailVerifiedAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    message: "Email verified successfully",
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};

const resendOtp = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate new OTP
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + (Number(process.env.OTP_EXPIRY || 5) * 60 * 1000));

  // Update user with new OTP
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send OTP via email
  const emailResult = await sendOtpToEmail(email, otp);

  if (!emailResult.success) {
    throw new ApiError(500, `Failed to send OTP: ${emailResult.message}`);
  }

  return {
    message: "OTP sent successfully to your email",
    expiresIn: `${process.env.OTP_EXPIRY || 5} minutes`
  };
};

module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  sanitizeUser
};
