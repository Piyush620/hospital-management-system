# Backend API Contract (Frozen v1)

Last updated: 2026-03-10

This file is the source of truth for frontend integration and Postman/OpenAPI generation.

## Base URL
- Local: `http://localhost:5000`
- API prefix: `/api`

## Auth Header
- Protected routes require:
`Authorization: Bearer <accessToken>`

## Roles
- `SUPER_ADMIN`
- `HOSPITAL_ADMIN`
- `DOCTOR`
- `STAFF`

## Response Contract
- Success:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```
- Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Rate Limits
- `/api/*`: `RATE_LIMIT_MAX` per `RATE_LIMIT_WINDOW_MS` (defaults 300 requests / 15 min)
- `/api/auth/*`: `AUTH_RATE_LIMIT_MAX` per `AUTH_RATE_LIMIT_WINDOW_MS` (defaults 50 requests / 15 min)

## Health Routes
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | No | Service health |
| GET | `/api/health` | No | API health |
| GET | `/ready` | No | DB readiness |
| GET | `/api/ready` | No | DB readiness (alias) |

## Auth Routes
| Method | Path | Auth | Body (required) | Success |
|---|---|---|---|---|
| POST | `/api/auth/signup` | No | `name,email,phone,password`, optional `role` | `200` |
| POST | `/api/auth/login` | No | `email,password` | `200` (`data.user`, `data.accessToken`, `data.refreshToken`) |
| POST | `/api/auth/verify-otp` | No | `email,otp` | `200` (`data.user`) |
| POST | `/api/auth/resend-otp` | No | `email` | `200` |
| POST | `/api/auth/refresh-token` | No | `refreshToken` | `200` (`data.accessToken`) |

## Utility Protected Routes
| Method | Path | Roles | Success |
|---|---|---|---|
| GET | `/api/test` | Any authenticated user | `200` |
| GET | `/api/admin-test` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | `200` |

## Module Routes

### Hospitals
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/hospitals` | `SUPER_ADMIN` | body: `name` |
| GET | `/api/hospitals` | any authenticated | - |
| GET | `/api/hospitals/:id` | any authenticated | path: `id` |
| PUT | `/api/hospitals/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/hospitals/:id` | `SUPER_ADMIN` | path: `id` |

### Departments
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/departments` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | body: `name,hospitalId` |
| GET | `/api/departments` | any authenticated | query: `hospitalId` |
| PUT | `/api/departments/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/departments/:id` | `SUPER_ADMIN` | path: `id` |

### Doctors
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/doctors` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | body: `name,specialization,experience,consultationFee,departmentId,hospitalId` |
| GET | `/api/doctors` | any authenticated | optional query: `hospitalId,departmentId,page,limit` |
| PUT | `/api/doctors/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/doctors/:id` | `SUPER_ADMIN` | path: `id` |

### Patients
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/patients` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `STAFF` | body: `name,phone,age,gender,hospitalId` |
| GET | `/api/patients` | any authenticated | optional query: `hospitalId,page,limit` |
| PUT | `/api/patients/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `STAFF` | path: `id` |
| DELETE | `/api/patients/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |

### Appointments
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/appointments` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `STAFF` | body: `patientId,doctorId,hospitalId,appointmentDate` (future date) |
| GET | `/api/appointments` | any authenticated | query: `hospitalId` |
| GET | `/api/appointments/doctor/:doctorId` | any authenticated | path: `doctorId` |
| PUT | `/api/appointments/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR` | path: `id` |
| DELETE | `/api/appointments/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |

### Wards
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/wards` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | body: `name,hospitalId` |
| GET | `/api/wards` | any authenticated | query: `hospitalId` |
| PUT | `/api/wards/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/wards/:id` | `SUPER_ADMIN` | path: `id` |

### Rooms
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/rooms` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | body: `roomNumber,wardId` |
| GET | `/api/rooms` | any authenticated | query: `wardId` or `hospitalId` |
| PUT | `/api/rooms/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/rooms/:id` | `SUPER_ADMIN` | path: `id` |

### Beds
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/beds` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | body: `bedNumber,roomId,hospitalId` |
| GET | `/api/beds` | any authenticated | query: `hospitalId` |
| PUT | `/api/beds/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/beds/:id` | `SUPER_ADMIN` | path: `id` |

### Admissions
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/admissions` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR` | body: `patientId,doctorId,bedId,hospitalId` |
| GET | `/api/admissions` | any authenticated | query: `hospitalId` |
| PUT | `/api/admissions/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR` | path: `id` |
| POST | `/api/admissions/discharge/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR` | path: `id` |

### Billings
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/billings` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `STAFF` | body: `patientId,admissionId,hospitalId,amount` |
| GET | `/api/billings` | any authenticated | query: `hospitalId` |
| PUT | `/api/billings/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/billings/:id` | `SUPER_ADMIN` | path: `id` |

### Payments
| Method | Path | Roles | Required Input |
|---|---|---|---|
| POST | `/api/payments` | `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `STAFF` | body: `billingId,hospitalId,amount,method` |
| GET | `/api/payments` | any authenticated | query: `hospitalId` |
| PUT | `/api/payments/:id` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | path: `id` |
| DELETE | `/api/payments/:id` | `SUPER_ADMIN` | path: `id` |

### Dashboard and Audit
| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/api/dashboard/stats` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | Aggregated stats |
| GET | `/api/departments/stats` | `SUPER_ADMIN`, `HOSPITAL_ADMIN` | Alias route to dashboard stats |
| GET | `/api/audit-logs` | `SUPER_ADMIN` | Paged query: `page,limit` |

## Integration Rules (Do Not Change Without Version Bump)
- Keep route paths and HTTP methods stable.
- Keep auth response schema stable (`success`, `message`, `data`).
- Keep role guard behavior stable.
- If any endpoint contract changes, update this file and increment to v2.
