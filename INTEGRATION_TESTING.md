# Integration Testing Guide - Full End-to-End Workflow

Complete testing of all 14 API modules with real data flows.

---

## 🚀 Prerequisites

### Start Docker
```powershell
cd c:\Users\piyus\Desktop\hospital-management-system-master\hospital-management-system-master
docker-compose up --build
```

Wait for:
```
hospital-backend  | ✅ Firebase initialized successfully
hospital-backend  | Server running on port 5000
```

### Have Ready
- Email address (for signup)
- Postman or curl
- Text editor (to save tokens/IDs)

---

## 📋 Complete Testing Workflow

### Phase 1: Authentication ✅

#### 1.1 Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "TestPass123!",
    "name": "Test User",
    "phone": "9876543210",
    "role": "SUPER_ADMIN"
  }'
```

**Expected:** Success message

**Save:** Email address

---

#### 1.2 Get OTP from Docker Logs
```powershell
docker-compose logs backend | Select-String "\[OTP\]"
```

**Look for:**
```
[OTP] Sent to testuser@gmail.com: 123456
```

**Save:** OTP code

---

#### 1.3 Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "otp": "123456"
  }'
```

**Expected:** accessToken & refreshToken

**Save:** accessToken (needed for all protected endpoints)

---

#### 1.4 Login (Test login after verification)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "TestPass123!"
  }'
```

**Expected:** New accessToken & refreshToken

---

### Phase 2: Hospital Management ✅

#### 2.1 Create Hospital
```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "City Hospital",
    "address": "123 Main Street",
    "phone": "2125551234"
  }'
```

**Expected:** Hospital ID in response

**Save:** hospitalId

---

#### 2.2 Get All Hospitals
```bash
curl -X GET http://localhost:5000/api/hospitals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Array of hospitals

---

### Phase 3: Department & Staff Setup ✅

#### 3.1 Create Department
```bash
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Cardiology",
    "description": "Heart and cardiovascular diseases",
    "hospitalId": "YOUR_HOSPITAL_ID"
  }'
```

**Expected:** Department ID

**Save:** departmentId

---

#### 3.2 Create Doctor
```bash
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Dr. John Smith",
    "specialization": "Cardiologist",
    "experience": 10,
    "consultationFee": 500,
    "departmentId": "YOUR_DEPARTMENT_ID",
    "hospitalId": "YOUR_HOSPITAL_ID"
  }'
```

**Expected:** Doctor ID

**Save:** doctorId

---

#### 3.3 Get All Doctors
```bash
curl -X GET "http://localhost:5000/api/doctors?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Array of doctors

---

### Phase 4: Patient Registration ✅

#### 4.1 Create Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "John Doe",
    "age": 45,
    "gender": "MALE",
    "phone": "9876543210",
    "address": "456 Oak Avenue",
    "bloodGroup": "O+",
    "hospitalId": "YOUR_HOSPITAL_ID"
  }'
```

**Expected:** Patient ID

**Save:** patientId

---

#### 4.2 Get All Patients
```bash
curl -X GET "http://localhost:5000/api/patients?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Patient list with pagination

---

### Phase 5: Appointment Scheduling ✅

#### 5.1 Create Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "patientId": "YOUR_PATIENT_ID",
    "doctorId": "YOUR_DOCTOR_ID",
    "departmentId": "YOUR_DEPARTMENT_ID",
    "hospitalId": "YOUR_HOSPITAL_ID",
    "appointmentDate": "2026-03-20T10:30:00Z",
    "notes": "Regular checkup"
  }'
```

**Expected:** Appointment ID

**Save:** appointmentId

---

#### 5.2 Get Appointments
```bash
curl -X GET "http://localhost:5000/api/appointments?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** List of appointments

---

#### 5.3 Get Doctor's Appointments
```bash
curl -X GET "http://localhost:5000/api/appointments/doctor/YOUR_DOCTOR_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Appointments for specific doctor

---

### Phase 6: Ward & Bed Management ✅

#### 6.1 Create Ward
```bash
curl -X POST http://localhost:5000/api/wards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "ICU Ward",
    "description": "Intensive Care Unit",
    "hospitalId": "YOUR_HOSPITAL_ID"
  }'
```

**Expected:** Ward ID

**Save:** wardId

---

#### 6.2 Create Room
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "roomNumber": "ICU-101",
    "type": "ICU",
    "wardId": "YOUR_WARD_ID"
  }'
```

**Expected:** Room ID

**Save:** roomId

---

#### 6.3 Create Bed
```bash
curl -X POST http://localhost:5000/api/beds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "bedNumber": "ICU-101-A",
    "roomId": "YOUR_ROOM_ID",
    "hospitalId": "YOUR_HOSPITAL_ID",
    "status": "AVAILABLE"
  }'
```

**Expected:** Bed ID

**Save:** bedId

---

#### 6.4 Get Available Beds
```bash
curl -X GET "http://localhost:5000/api/beds?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** List of beds with status

---

### Phase 7: Admission Workflow ✅

#### 7.1 Admit Patient
```bash
curl -X POST http://localhost:5000/api/admissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "patientId": "YOUR_PATIENT_ID",
    "doctorId": "YOUR_DOCTOR_ID",
    "bedId": "YOUR_BED_ID",
    "hospitalId": "YOUR_HOSPITAL_ID",
    "reason": "Chest pain - cardiac evaluation",
    "status": "ADMITTED"
  }'
```

**Expected:** Admission ID

**Save:** admissionId

**Verify:** Bed status changes to "OCCUPIED"

---

#### 7.2 Get Admissions
```bash
curl -X GET "http://localhost:5000/api/admissions?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** List of admissions

---

#### 7.3 Discharge Patient
```bash
curl -X POST http://localhost:5000/api/admissions/discharge/YOUR_ADMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Admission status = "DISCHARGED"

**Verify:** Bed status returns to "AVAILABLE"

---

### Phase 8: Billing & Payment ✅

#### 8.1 Create Billing
```bash
curl -X POST http://localhost:5000/api/billings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "patientId": "YOUR_PATIENT_ID",
    "admissionId": "YOUR_ADMISSION_ID",
    "hospitalId": "YOUR_HOSPITAL_ID",
    "amount": 5000,
    "description": "Hospital charges + medications"
  }'
```

**Expected:** Billing ID

**Save:** billingId

**Verify:** Status = "PENDING"

---

#### 8.2 Get Billings
```bash
curl -X GET "http://localhost:5000/api/billings?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** List of bills

---

#### 8.3 Create Payment
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "billingId": "YOUR_BILLING_ID",
    "hospitalId": "YOUR_HOSPITAL_ID",
    "amount": 5000,
    "method": "Card",
    "transactionId": "TXN-123456"
  }'
```

**Expected:** Payment ID

**Verify:** Billing status changes to "PAID"

---

#### 8.4 Get Payments
```bash
curl -X GET "http://localhost:5000/api/payments?hospitalId=YOUR_HOSPITAL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** List of payments with status = "Completed"

---

### Phase 9: Dashboard Analytics ✅

#### 9.1 Get Statistics
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 1,
    "totalDoctors": 1,
    "totalAppointments": 1,
    "totalBeds": 1,
    "occupiedBeds": 0,
    "totalRevenue": 5000
  }
}
```

---

### Phase 10: Audit Logging (Admin Only) ✅

#### 10.1 Get Audit Logs
```bash
curl -X GET http://localhost:5000/api/audit-logs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Logs of all actions (CREATE, UPDATE, DELETE, etc.)

---

## 🧪 Testing Checklist

### Authentication ✅
- [ ] Signup succeeds
- [ ] OTP received in logs/email
- [ ] OTP verification succeeds
- [ ] Login works after verification
- [ ] Invalid OTP rejected
- [ ] Expired OTP rejected

### Hospital & Staff ✅
- [ ] Hospital creation succeeds
- [ ] Department creation succeeds
- [ ] Doctor creation succeeds
- [ ] Get operations return data
- [ ] List operations have pagination

### Patients & Appointments ✅
- [ ] Patient creation succeeds
- [ ] Appointment scheduling works
- [ ] Future date requirement enforced
- [ ] Doctor appointments filter works

### Bed Management ✅
- [ ] Ward creation succeeds
- [ ] Room creation succeeds
- [ ] Bed creation succeeds
- [ ] Bed status is "AVAILABLE" initially

### Admission Workflow ✅
- [ ] Admission creation succeeds
- [ ] Bed status changes to "OCCUPIED"
- [ ] Discharge works
- [ ] Bed status returns to "AVAILABLE"

### Billing & Payment ✅
- [ ] Bill creation succeeds (status = PENDING)
- [ ] Payment creation succeeds (status = Completed)
- [ ] Bill status changes to PAID after payment
- [ ] Revenue calculation includes payment

### Dashboard ✅
- [ ] Dashboard returns accurate stats
- [ ] Total revenue matches payment sum

### Audit ✅
- [ ] Audit logs record all operations
- [ ] Admin can view logs

### Error Handling ✅
- [ ] Invalid hospital ID returns 404
- [ ] Missing required fields return 400
- [ ] Unauthorized requests return 401
- [ ] Forbidden actions return 403
- [ ] Rate limiting works (>300 requests in 15min)

---

## 🔍 Common Issues & Fixes

### Issue: Cannot find module 'firebase-key.json'
**Fix:** Firebase is optional - check Docker logs for "[Firebase]" messages

### Issue: OTP not showing in logs
**Fix:**
```powershell
docker-compose logs backend | Select-String "OTP"
```

### Issue: Bearer token expired
**Fix:** Generate new token with login endpoint

### Issue: MongoDB connection error
**Fix:**
```powershell
docker-compose restart mongo
```

### Issue: Bed already occupied error
**Fix:** Create a new bed or discharge patient from occupied bed

---

## 📊 Expected Testing Timeline

| Phase | Duration | Tests |
|-------|----------|-------|
| Phase 1 (Auth) | 5 min | 4 |
| Phase 2 (Hospital) | 3 min | 2 |
| Phase 3 (Staff) | 5 min | 3 |
| Phase 4 (Patients) | 3 min | 2 |
| Phase 5 (Appointments) | 5 min | 3 |
| Phase 6 (Beds) | 5 min | 4 |
| Phase 7 (Admission) | 5 min | 3 |
| Phase 8 (Billing) | 5 min | 4 |
| Phase 9 (Dashboard) | 2 min | 1 |
| Phase 10 (Audit) | 2 min | 1 |
| **TOTAL** | **~40 min** | **32 tests** |

---

## ✅ Success Criteria

**All PASS if:**
- ✅ All endpoints return 200/201
- ✅ Data relationships work correctly
- ✅ Status transitions work (PENDING → PAID, AVAILABLE → OCCUPIED)
- ✅ Calculations correct (revenue sum)
- ✅ Error handling works
- ✅ Audit logs capture actions

---

## 🎯 Next After Testing

- **All Pass?** → Production deployment ready ✅
- **Some Fail?** → Debug and fix issues 🔧
- **Major Issues?** → Revisit architecture 🏗️

---

**Happy Testing! 🧪**
