export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  DOCTOR: "DOCTOR",
  STAFF: "STAFF"
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.HOSPITAL_ADMIN]: "Hospital Admin",
  [ROLES.DOCTOR]: "Doctor",
  [ROLES.STAFF]: "Staff"
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
export const GENDERS = ["MALE", "FEMALE", "OTHER"];
export const APPOINTMENT_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
export const ROOM_TYPES = ["General", "Private", "ICU"];
export const BED_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"];
export const ADMISSION_STATUSES = ["ADMITTED", "DISCHARGED"];
export const BILLING_STATUSES = ["PENDING", "PAID"];
export const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Insurance"];
export const PAYMENT_STATUSES = ["Pending", "Completed", "Failed"];
