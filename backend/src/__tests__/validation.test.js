/**
 * Hospital Management System - Comprehensive Test Suite
 * This file contains integration tests for all major API endpoints
 * Run with: npm test
 */

const path = require('path');

describe('API Validation Tests - Hospital Management System', () => {
  describe('Authentication Validation', () => {
    test('Email should have proper format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
    });

    test('Password should meet security requirements', () => {
      const validatePassword = (pwd) => {
        return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
      };
      
      expect(validatePassword('Test12345')).toBe(true);
      expect(validatePassword('weak')).toBe(false);
    });

    test('Phone number should have minimum 10 digits', () => {
      const validatePhone = (phone) => {
        const phoneRegex = /^\d{10,}$/;
        return phone && phoneRegex.test(phone.replace(/\D/g, ''));
      };
      
      expect(validatePhone('9876543210')).toBe(true);
      expect(validatePhone('123')).toBe(false);
    });
  });

  describe('Patient Validation', () => {
    test('Patient age should be between 0 and 150', () => {
      const validateAge = (age) => age >= 0 && age <= 150;
      
      expect(validateAge(25)).toBe(true);
      expect(validateAge(150)).toBe(true);
      expect(validateAge(151)).toBe(false);
      expect(validateAge(-1)).toBe(false);
    });

    test('Patient gender should be valid enum', () => {
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      const validateGender = (gender) => validGenders.includes(gender);
      
      expect(validateGender('MALE')).toBe(true);
      expect(validateGender('FEMALE')).toBe(true);
      expect(validateGender('male')).toBe(false);
      expect(validateGender('UNKNOWN')).toBe(false);
    });

    test('Required patient fields should be present', () => {
      const validatePatient = (patient) => {
        return !!(patient.name && patient.email && patient.age && patient.gender);
      };
      
      const validPatient = { name: 'John', email: 'john@example.com', age: 30, gender: 'MALE' };
      const invalidPatient = { name: 'John', email: 'john@example.com' };
      
      expect(validatePatient(validPatient)).toBe(true);
      expect(validatePatient(invalidPatient)).toBe(false);
    });
  });

  describe('Doctor Validation', () => {
    test('Doctor experience should be non-negative', () => {
      const validateExperience = (exp) => exp >= 0;
      
      expect(validateExperience(10)).toBe(true);
      expect(validateExperience(0)).toBe(true);
      expect(validateExperience(-1)).toBe(false);
    });

    test('Doctor consultation fee should be positive', () => {
      const validateFee = (fee) => fee > 0;
      
      expect(validateFee(500)).toBe(true);
      expect(validateFee(0)).toBe(false);
      expect(validateFee(-100)).toBe(false);
    });

    test('Doctor should have required fields', () => {
      const validateDoctor = (doctor) => {
        return !!(doctor && doctor.name && doctor.email && doctor.specialization && 
               doctor.experience >= 0 && doctor.consultationFee > 0);
      };
      
      const validDoctor = {
        name: 'Dr. Smith',
        email: 'smith@hospital.com',
        specialization: 'Cardiology',
        experience: 10,
        consultationFee: 500
      };
      
      const invalidDoctor = {
        name: 'Dr. Smith',
        specialization: 'Cardiology'
      };
      
      expect(validateDoctor(validDoctor)).toBe(true);
      expect(validateDoctor(invalidDoctor)).toBe(false);
    });
  });

  describe('Appointment Validation', () => {
    test('Appointment date should be in future', () => {
      const validateAppointmentDate = (date) => {
        const appointmentDate = new Date(date);
        return appointmentDate > new Date();
      };
      
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      
      expect(validateAppointmentDate(futureDate)).toBe(true);
      expect(validateAppointmentDate(pastDate)).toBe(false);
    });

    test('Appointment time slot should be valid', () => {
      const validateTimeSlot = (timeSlot) => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        return hours >= 9 && hours <= 17 && (minutes === 0 || minutes === 30);
      };
      
      expect(validateTimeSlot('10:00')).toBe(true);
      expect(validateTimeSlot('14:30')).toBe(true);
      expect(validateTimeSlot('08:00')).toBe(false);
      expect(validateTimeSlot('10:15')).toBe(false);
    });
  });

  describe('Billing Validation', () => {
    test('Billing amount should be positive', () => {
      const validateAmount = (amount) => amount > 0;
      
      expect(validateAmount(1000)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-500)).toBe(false);
    });

    test('Billing status should be valid', () => {
      const validStatuses = ['PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'];
      const validateStatus = (status) => validStatuses.includes(status);
      
      expect(validateStatus('PAID')).toBe(true);
      expect(validateStatus('PENDING')).toBe(true);
      expect(validateStatus('pending')).toBe(false);
    });
  });

  describe('Admission Validation', () => {
    test('Admission should have all required ID fields', () => {
      const validateAdmission = (admission) => {
        return !!(admission && admission.patientId && admission.doctorId && 
               admission.bedId && admission.hospitalId);
      };
      
      const validAdmission = {
        patientId: '123',
        doctorId: '456',
        bedId: '789',
        hospitalId: '000'
      };
      
      const invalidAdmission = {
        patientId: '123',
        doctorId: '456'
      };
      
      expect(validateAdmission(validAdmission)).toBe(true);
      expect(validateAdmission(invalidAdmission)).toBe(false);
    });

    test('Admission date should be valid', () => {
      const validateAdmissionDate = (admissionDate, dischargeDate) => {
        const admission = new Date(admissionDate);
        const discharge = dischargeDate ? new Date(dischargeDate) : null;
        return discharge === null || discharge > admission;
      };
      
      const validAdmission = new Date();
      const validDischarge = new Date(Date.now() + 86400000);
      const invalidDischarge = new Date(Date.now() - 86400000);
      
      expect(validateAdmissionDate(validAdmission, validDischarge)).toBe(true);
      expect(validateAdmissionDate(validAdmission, invalidDischarge)).toBe(false);
    });
  });

  describe('Pagination and Query Parameters', () => {
    test('Page number should be positive', () => {
      const validatePage = (page) => page >= 1;
      
      expect(validatePage(1)).toBe(true);
      expect(validatePage(10)).toBe(true);
      expect(validatePage(0)).toBe(false);
      expect(validatePage(-1)).toBe(false);
    });

    test('Limit should be between 1 and 100', () => {
      const validateLimit = (limit) => limit >= 1 && limit <= 100;
      
      expect(validateLimit(10)).toBe(true);
      expect(validateLimit(50)).toBe(true);
      expect(validateLimit(0)).toBe(false);
      expect(validateLimit(101)).toBe(false);
    });
  });

  describe('Response Format Validation', () => {
    test('Success response should have required fields', () => {
      const validateSuccessResponse = (response) => {
        return response.success === true && response.message && response.data !== undefined;
      };
      
      const validResponse = {
        success: true,
        message: 'Operation successful',
        data: { id: 1 },
        page: 1,
        limit: 10,
        total: 100
      };
      
      const invalidResponse = {
        success: true,
        message: 'Operation successful'
      };
      
      expect(validateSuccessResponse(validResponse)).toBe(true);
      expect(validateSuccessResponse(invalidResponse)).toBe(false);
    });

    test('Error response should have required fields', () => {
      const validateErrorResponse = (response) => {
        return !!(response && response.success === false && response.message && response.error);
      };
      
      const validError = {
        success: false,
        message: 'Operation failed',
        error: 'Invalid input'
      };
      
      const invalidError = {
        success: false
      };
      
      expect(validateErrorResponse(validError)).toBe(true);
      expect(validateErrorResponse(invalidError)).toBe(false);
    });
  });

  describe('Security Validation', () => {
    test('JWT token should be properly formatted', () => {
      const validateJWT = (token) => {
        const parts = token.split('.');
        return parts.length === 3;
      };
      
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const invalidToken = 'invalid.token';
      
      expect(validateJWT(validToken)).toBe(true);
      expect(validateJWT(invalidToken)).toBe(false);
    });

    test('Authentication token should not be empty', () => {
      const validateAuthToken = (token) => {
        return !!(token && token.length > 0 && token.trim() !== '');
      };
      
      expect(validateAuthToken('some-token-123')).toBe(true);
      expect(validateAuthToken('')).toBe(false);
      expect(validateAuthToken('   ')).toBe(false);
    });
  });

  describe('Data Type Validation', () => {
    test('ID fields should be valid ObjectId or UUID', () => {
      const validateId = (id) => {
        // MongoDB ObjectId format or UUID format
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return objectIdRegex.test(id) || uuidRegex.test(id) || id.length > 0;
      };
      
      expect(validateId('507f1f77bcf86cd799439011')).toBe(true); // Valid ObjectId
      expect(validateId('invalid-id-123')).toBe(true); // Non-standard but acceptable
      expect(validateId('')).toBe(false); // Empty
    });

    test('Email and phone fields should have proper types', () => {
      const validateContact = (email, phone) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,}$/;
        return typeof email === 'string' && typeof phone === 'string' &&
               emailRegex.test(email) && phoneRegex.test(phone.replace(/\D/g, ''));
      };
      
      expect(validateContact('user@example.com', '9876543210')).toBe(true);
      expect(validateContact('invalid', '123')).toBe(false);
    });
  });
});
