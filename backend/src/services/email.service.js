const nodemailer = require('nodemailer');
const { sendOtpSms } = require("./otp.service");

// Create Gmail SMTP transporter
const createGmailTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be configured for email OTP');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });
};

// Build OTP email content
const buildOtpEmailContent = (otp) => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY || 5);
  return {
    subject: 'PulseOps HMS - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">PulseOps Hospital Management System</h2>
        </div>

        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e9ecef;">
          <h3 style="color: #495057; margin-top: 0;">Your One-Time Password (OTP)</h3>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">${otp}</span>
          </div>

          <p style="color: #6c757d; margin-bottom: 10px;">
            This OTP is valid for <strong>${expiryMinutes} minutes</strong>.
          </p>

          <p style="color: #6c757d; margin-bottom: 10px;">
            If you didn't request this OTP, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">

          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            This is an automated message from PulseOps HMS. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `PulseOps HMS OTP: ${otp}. Valid for ${expiryMinutes} minutes. If you didn't request this, please ignore.`
  };
};

// Send OTP via email
exports.sendOtpToEmail = async (email, otp) => {
  try {
    const transporter = createGmailTransporter();
    const emailContent = buildOtpEmailContent(otp);

    const mailOptions = {
      from: `"PulseOps HMS" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "OTP sent via email",
      provider: "gmail",
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email OTP error:', error);
    return {
      success: false,
      message: `Failed to send OTP email: ${error.message}`
    };
  }
};

exports.sendOtpToPhone = async (phone, otp) => {
  return sendOtpSms(phone, otp);
};
