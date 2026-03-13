const { sendOtpSms } = require("./otp.service");

exports.sendOtpToPhone = async (phone, otp) => {
  return sendOtpSms(phone, otp);
};
