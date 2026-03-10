/**
 * Send OTP via Brevo Email (Any Recipient, 300/day)
 */
exports.sendOtpViaFirebase = async (email, otp) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoFromEmail = process.env.BREVO_FROM_EMAIL || "noreply@brevo.com";

  // If Brevo is configured, send real email
  if (brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: {
            email: brevoFromEmail,
            name: "Hospital Management System"
          },
          to: [
            {
              email: email
            }
          ],
          subject: "Your Hospital Management System OTP",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto;">
              <h2 style="color: #2c3e50;">Hospital Management System</h2>
              <p>Dear User,</p>
              <p>Your One-Time Password (OTP) is:</p>
              <div style="background-color: #ecf0f1; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                <h1 style="color: #e74c3c; letter-spacing: 5px; margin: 0;">${otp}</h1>
              </div>
              <p><strong>Valid for 5 minutes</strong></p>
              <p style="color: #7f8c8d; font-size: 12px;">
                If you didn't request this code, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
              <p style="color: #95a5a6; font-size: 11px;">
                (c) 2026 Hospital Management System. All rights reserved.
              </p>
            </div>
          `
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("[Brevo Error]", result);
        // Fallback to console if email fails
        console.log(`[OTP][FALLBACK] ${email}: ${otp}`);
        return { success: false, message: result?.message || "Failed to send email" };
      }

      console.log(`[OTP][EMAIL_SENT] to=${email} id=${result?.messageId || "n/a"}`);
      console.log(`[OTP][CODE] ${otp} (Valid for 5 minutes)`);
      return { success: true, message: "OTP sent successfully via email" };
    } catch (error) {
      console.error("[Brevo Error]", error.message);
      // Fallback to console if email fails
      console.log(`[OTP][FALLBACK] ${email}: ${otp}`);
      return { success: false, message: error.message };
    }
  } else {
    // Dev mode - log to console
    console.log(`[OTP][DEV] ${email}: ${otp} (Valid for 5 minutes)`);
    return { success: true, message: "OTP logged to console (dev mode)" };
  }
};

/**
 * Verify OTP (this happens in auth.service.js)
 * Just return true if OTP matches
 */
exports.verifyOtpViaFirebase = async (email, otp, storedOtp) => {
  if (String(otp) === String(storedOtp)) {
    return { success: true, message: "OTP verified" };
  }
  return { success: false, message: "Invalid OTP" };
};

/**
 * Get Firebase Auth instance
 */
exports.getFirebaseAuth = () => {
  const { firebaseApp, admin } = require("../config/firebase");
  if (!firebaseApp) {
    console.warn("[Firebase] App not initialized");
    return null;
  }
  return admin.auth();
};
