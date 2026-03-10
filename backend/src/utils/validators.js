/**
 * Input Validation Utilities
 * Validates incoming request data for all modules
 */

const ApiError = require("../errors/ApiError");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};

const validateAge = (age) => {
  const ageNum = parseInt(age);
  return ageNum >= 0 && ageNum <= 150;
};

const validateGender = (gender) => {
  return ['MALE', 'FEMALE', 'OTHER'].includes(gender?.toUpperCase());
};

const validateRequired = (obj, fields) => {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      throw new ApiError(400, `${field} is required`);
    }
  }
};

const validateDoctorCreate = (data) => {
  validateRequired(data, ['name', 'specialization', 'departmentId', 'hospitalId']);
  
  if (data.experience === undefined || data.experience === null) {
    throw new ApiError(400, "experience is required");
  }
  if (data.consultationFee === undefined || data.consultationFee === null) {
    throw new ApiError(400, "consultationFee is required");
  }
  
  if (typeof data.experience !== 'number' || data.experience < 0) {
    throw new ApiError(400, "experience must be a positive number");
  }
  if (typeof data.consultationFee !== 'number' || data.consultationFee < 0) {
    throw new ApiError(400, "consultationFee must be a positive number");
  }
};

const validatePatientCreate = (data) => {
  validateRequired(data, ['name', 'phone', 'age', 'gender', 'hospitalId']);
  
  if (!validatePhone(data.phone)) {
    throw new ApiError(400, "phone must be at least 10 digits");
  }
  if (!validateAge(data.age)) {
    throw new ApiError(400, "age must be between 0 and 150");
  }
  if (!validateGender(data.gender)) {
    throw new ApiError(400, "gender must be MALE, FEMALE, or OTHER");
  }
};

const validateAppointmentCreate = (data) => {
  validateRequired(data, ['patientId', 'doctorId', 'hospitalId', 'appointmentDate']);
  
  const appointmentDate = new Date(data.appointmentDate);
  if (isNaN(appointmentDate.getTime())) {
    throw new ApiError(400, "appointmentDate must be a valid date");
  }
  if (appointmentDate < new Date()) {
    throw new ApiError(400, "appointmentDate must be in the future");
  }
};

const validateAdmissionCreate = (data) => {
  validateRequired(data, ['patientId', 'doctorId', 'bedId', 'hospitalId']);
};

const validateBillingCreate = (data) => {
  validateRequired(data, ['patientId', 'admissionId', 'amount', 'hospitalId']);
  
  if (typeof data.amount !== 'number' || data.amount <= 0) {
    throw new ApiError(400, "amount must be a positive number");
  }
};

const validateDepartmentCreate = (data) => {
  validateRequired(data, ['name', 'hospitalId']);
};

const validateWardCreate = (data) => {
  validateRequired(data, ['name', 'hospitalId']);
};

const validateRoomCreate = (data) => {
  validateRequired(data, ['roomNumber', 'wardId']);
};

const validateBedCreate = (data) => {
  validateRequired(data, ['bedNumber', 'roomId', 'hospitalId']);
};

module.exports = {
  validateEmail,
  validatePhone,
  validateAge,
  validateGender,
  validateRequired,
  validateDoctorCreate,
  validatePatientCreate,
  validateAppointmentCreate,
  validateAdmissionCreate,
  validateBillingCreate,
  validateDepartmentCreate,
  validateWardCreate,
  validateRoomCreate,
  validateBedCreate
};
