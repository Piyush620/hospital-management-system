// This mock disables real email sending for tests and avoids the need for GMAIL_USER and GMAIL_APP_PASSWORD.
module.exports = {
  createGmailTransporter: () => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mocked-message-id',
    }),
  }),
  sendOtpToEmail: async () => ({
    success: true,
    message: 'Mocked OTP sent',
  }),
};
