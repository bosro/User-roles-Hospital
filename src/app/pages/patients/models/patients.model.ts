// models/patients.model.ts

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address?: string;
  status: PatientStatus;
  registrationDate: string;
  medicalHistory: MedicalHistory;
  insurance: Insurance;
}

export type PatientStatus = 'active' | 'inactive' | 'new';

export interface MedicalHistory {
  allergies: string[];
  conditions: string[];
  surgeries: string[];
  medications: string[];
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  expiryDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  type: string;
  date: string;
  status: AppointmentStatus;
  vitals?: VitalSigns;
  diagnosis?: string[];
  prescriptions?: Prescription[];
  notes?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface VitalSigns {
  bloodPressure: string;
  temperature: number;
  heartRate: number;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
}