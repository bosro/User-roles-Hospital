// Base interfaces
interface BaseProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  bio?: string;
  stats: ProfileStats;
  preferences: UserPreferences;
}

interface ProfileStats {
  totalPatients?: number;
  appointmentsThisMonth?: number;
  yearsOfService?: number;
  totalAppointments?: number;
  completedProcedures?: number;
  assignedPatients?: number;
  admittedPatients?: number;
  dischargedPatients?: number;
  admittedDays?: number;
  lastVisit?: Date;
  totalDepartments?: number;
  totalStaff?: number;
  activePatients?: number;
}

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  darkMode: boolean;
  compactView: boolean;
}

interface LoginActivity {
  location: string;
  device: string;
  timestamp: Date;
  status: 'success' | 'failed';
  ipAddress?: string;
}

// Role-specific interfaces
interface DoctorProfile extends BaseProfile {
  role: 'doctor';
  prefix: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  consultationFee: number;
  availability?: {
    workingDays: string[];
    startTime: string;
    endTime: string;
  };
}

interface NurseProfile extends BaseProfile {
  role: 'nurse';
  department: string;
  shift: string;
  licenseNumber: string;
  specializations: string[];
}

interface PatientProfile extends BaseProfile {
  role: 'patient';
  dateOfBirth: string;
  bloodGroup: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
  };
}

interface AdminProfile extends BaseProfile {
  role: 'admin';
  department: string;
  permissions: string[];
  accessLevel: string;
}

type UserProfile = DoctorProfile | NurseProfile | PatientProfile | AdminProfile;

export type { 
  UserProfile, 
  BaseProfile, 
  ProfileStats, 
  UserPreferences, 
  LoginActivity,
  DoctorProfile,
  NurseProfile,
  PatientProfile,
  AdminProfile 
};