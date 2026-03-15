const { sendOtpToEmail } = require('./src/services/email.service');
const { generateOtp } = require('./src/services/otp.service');
require('dotenv').config();

async function testEmailOtp() {
  console.log('🧪 Testing Email OTP functionality...\n');

  // Test email address (replace with your email for testing)
  const testEmail = process.env.GMAIL_USER || 'your-test-email@gmail.com';
  const otp = generateOtp();

  console.log(`📧 Sending OTP to: ${testEmail}`);
  console.log(`🔢 Generated OTP: ${otp}\n`);

  try {
    const result = await sendOtpToEmail(testEmail, otp);

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`📨 Message ID: ${result.messageId}`);
      console.log(`📮 Provider: ${result.provider}`);
    } else {
      console.log('❌ Email sending failed!');
      console.log(`🚫 Error: ${result.message}`);
    }
  } catch (error) {
    console.log('💥 Unexpected error:', error.message);
  }
}

// Run the test
testEmailOtp();