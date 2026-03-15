const SMS_MODE = process.env.SMS_PROVIDER || "console";
const BREVO_SMS_ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/send";
const TWILIO_MESSAGES_ENDPOINT = (accountSid) =>
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
const TEXTBELT_ENDPOINT = "https://textbelt.com/text";
const ELKS_ENDPOINT = "https://api.46elks.com/a1/sms";
const { generateOtp: generateOtpUtil } = require("../utils/generateOtp");

const maskPhone = (phone) => {
  if (!phone) {
    return "unknown";
  }

  if (phone.length <= 4) {
    return phone;
  }

  return `${"*".repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
};

const normalizePhone = (phone) => {
  if (!phone) {
    return "";
  }

  const trimmed = String(phone).trim();

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  return trimmed.replace(/\D/g, "");
};

const formatPhoneForLog = (phone) => {
  return maskPhone(String(phone || ""));
};

const buildOtpMessage = (otp) => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY || 5);
  return `PulseOps HMS OTP: ${otp}. Valid for ${expiryMinutes} minutes.`;
};

const sendViaBrevo = async (phone, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SMS_SENDER || "PulseOps";
  const organisationPrefix = process.env.BREVO_SMS_ORGANISATION_PREFIX;
  const recipient = normalizePhone(phone);

  if (!apiKey) {
    return { success: false, message: "BREVO_API_KEY is not configured" };
  }

  if (!sender || sender.length > 15) {
    return { success: false, message: "BREVO_SMS_SENDER must be between 1 and 15 characters" };
  }

  if (!recipient) {
    return { success: false, message: "Phone number is invalid for Brevo SMS delivery" };
  }

  const payload = {
    sender,
    recipient,
    content: buildOtpMessage(otp),
    type: "transactional"
  };

  if (organisationPrefix) {
    payload.organisationPrefix = organisationPrefix;
  }

  const response = await fetch(BREVO_SMS_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const rawBody = await response.text();
  let data = null;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    data = rawBody;
  }

  if (!response.ok) {
    const providerMessage =
      data?.message ||
      data?.code ||
      (typeof data === "string" ? data : "Unknown Brevo error");

    return {
      success: false,
      message: `Brevo SMS request failed (${response.status}): ${providerMessage}`
    };
  }

  return {
    success: true,
    message: "OTP sent by SMS",
    provider: "brevo",
    messageId: data?.messageId || null
  };
};

const sendViaTwilio = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const recipient = normalizePhone(phone);

  if (!accountSid || !authToken) {
    return { success: false, message: "Twilio credentials are not configured" };
  }

  if (!fromNumber) {
    return { success: false, message: "TWILIO_PHONE_NUMBER is not configured" };
  }

  if (!recipient.startsWith("+")) {
    return { success: false, message: "Twilio requires phone numbers in E.164 format" };
  }

  const body = new URLSearchParams({
    To: recipient,
    From: fromNumber,
    Body: buildOtpMessage(otp)
  });

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(TWILIO_MESSAGES_ENDPOINT(accountSid), {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const rawBody = await response.text();
  let data = null;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    data = rawBody;
  }

  if (!response.ok) {
    const providerMessage =
      data?.message ||
      data?.code ||
      (typeof data === "string" ? data : "Unknown Twilio error");

    return {
      success: false,
      message: `Twilio SMS request failed (${response.status}): ${providerMessage}`
    };
  }

  return {
    success: true,
    message: "OTP sent by SMS",
    provider: "twilio",
    messageId: data?.sid || null
  };
};

const sendViaTextbelt = async (phone, otp) => {
  const apiKey = process.env.TEXTBELT_API_KEY;
  const recipient = normalizePhone(phone);

  if (!apiKey) {
    return { success: false, message: "TEXTBELT_API_KEY is not configured" };
  }

  if (!recipient) {
    return { success: false, message: "Phone number is invalid for Textbelt SMS delivery" };
  }

  const payload = {
    phone: recipient,
    message: buildOtpMessage(otp),
    key: apiKey
  };

  const response = await fetch(TEXTBELT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(payload).toString()
  });

  const rawBody = await response.text();
  let data = null;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    data = rawBody;
  }

  if (!response.ok || !data?.success) {
    const providerMessage =
      data?.error ||
      (typeof data === "string" ? data : "Unknown Textbelt error");

    return {
      success: false,
      message: `Textbelt SMS request failed: ${providerMessage}`
    };
  }

  return {
    success: true,
    message: "OTP sent by SMS",
    provider: "textbelt",
    messageId: data?.textId || null
  };
};

const sendViaElks = async (phone, otp) => {
  const username = process.env.ELKS_USERNAME;
  const password = process.env.ELKS_PASSWORD;
  const fromNumber = process.env.ELKS_FROM_NUMBER || "PulseOps";
  const recipient = normalizePhone(phone);

  if (!username || !password) {
    return { success: false, message: "ELKS_USERNAME and ELKS_PASSWORD are not configured" };
  }

  if (!recipient) {
    return { success: false, message: "Phone number is invalid for 46elks SMS delivery" };
  }

  const payload = {
    from: fromNumber,
    to: recipient,
    message: buildOtpMessage(otp)
  };

  const authHeader = Buffer.from(`${username}:${password}`).toString("base64");
  const response = await fetch(ELKS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(payload).toString()
  });

  const rawBody = await response.text();
  let data = null;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    data = rawBody;
  }

  if (!response.ok) {
    const providerMessage =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "Unknown 46elks error");

    return {
      success: false,
      message: `46elks SMS request failed (${response.status}): ${providerMessage}`
    };
  }

  return {
    success: true,
    message: "OTP sent by SMS",
    provider: "46elks",
    messageId: data?.id || null
  };
};

function generateOtp() {
  return generateOtpUtil();
}

async function sendOtpSms(phone, otp) {
  if (!phone) {
    return { success: false, message: "Phone number is required for SMS OTP delivery" };
  }

  if (SMS_MODE === "console") {
    console.log(`[OTP][SMS][DEV] phone=${formatPhoneForLog(phone)} otp=${otp} (Valid for 5 minutes)`);
    return { success: true, message: "OTP logged to console as SMS (dev mode)" };
  }

  if (SMS_MODE === "mock-failure") {
    return { success: false, message: "Mock SMS provider failure" };
  }

  if (SMS_MODE === "brevo") {
    return sendViaBrevo(phone, otp);
  }

  if (SMS_MODE === "twilio") {
    return sendViaTwilio(phone, otp);
  }

  if (SMS_MODE === "textbelt") {
    return sendViaTextbelt(phone, otp);
  }

  if (SMS_MODE === "46elks") {
    return sendViaElks(phone, otp);
  }

  console.warn(`[OTP][SMS] Unsupported SMS_PROVIDER=${SMS_MODE}. Falling back to console logging.`);
  console.log(`[OTP][SMS][FALLBACK] phone=${formatPhoneForLog(phone)} otp=${otp}`);
  return { success: true, message: "OTP logged to console because SMS provider is not configured" };
}

async function verifyOtpCode(inputOtp, storedOtp) {
  if (String(inputOtp) === String(storedOtp)) {
    return { success: true, message: "OTP verified" };
  }

  return { success: false, message: "Invalid OTP" };
}

module.exports = {
  sendOtpSms,
  verifyOtpCode,
  generateOtp
};
