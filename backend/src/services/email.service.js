const { sendOtpViaFirebase } = require("./otp.service");

exports.sendOtpEmail = async (email, otp) => {
  // Using Firebase Authentication for OTP verification
  const result = await sendOtpViaFirebase(email, otp);
  return result;
};
