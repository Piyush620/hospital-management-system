export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isPhone(value) {
  return /^\+[1-9]\d{9,14}$/.test(String(value || "").replace(/\s+/g, ""));
}

export function validateLogin(form) {
  if (!form.email || !form.password) {
    return "Email and password are required.";
  }

  if (!isEmail(form.email)) {
    return "Enter a valid email address.";
  }

  return "";
}

export function validateSignup(form) {
  if (!form.name || !form.email || !form.phone || !form.password) {
    return "Name, email, phone, and password are required.";
  }

  if (!isEmail(form.email)) {
    return "Enter a valid email address.";
  }

  if (!isPhone(form.phone)) {
    return "Enter a valid phone number in international format, for example +919876543210.";
  }

  if (String(form.password).length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return "";
}

export function validateOtp(form) {
  if (!form.email || !form.otp) {
    return "Email and OTP are required.";
  }

  if (!isEmail(form.email)) {
    return "Enter a valid email address.";
  }

  if (!/^\d{4,8}$/.test(String(form.otp).trim())) {
    return "OTP should contain 4 to 8 digits.";
  }

  return "";
}

export function validateEmailOnly(email) {
  if (!email) {
    return "Email is required.";
  }

  if (!isEmail(email)) {
    return "Enter a valid email address.";
  }

  return "";
}

export function validateAppointment(form) {
  if (!form.patientId || !form.doctorId || !form.appointmentDate) {
    return "Patient, doctor, and appointment date are required.";
  }

  const date = new Date(form.appointmentDate);

  if (Number.isNaN(date.getTime())) {
    return "Enter a valid appointment date.";
  }

  if (date.getTime() <= Date.now()) {
    return "Appointment date must be in the future.";
  }

  return "";
}

export function validateAdmission(form) {
  if (!form.patientId || !form.doctorId || !form.bedId) {
    return "Patient, doctor, and bed are required.";
  }

  return "";
}

export function validateBilling(form) {
  if (!form.patientId || !form.admissionId || !form.amount) {
    return "Patient, admission, and amount are required.";
  }

  if (Number(form.amount) <= 0) {
    return "Billing amount must be greater than zero.";
  }

  return "";
}

export function validatePayment(form) {
  if (!form.billingId || !form.amount || !form.method) {
    return "Billing, amount, and payment method are required.";
  }

  if (Number(form.amount) <= 0) {
    return "Payment amount must be greater than zero.";
  }

  return "";
}
