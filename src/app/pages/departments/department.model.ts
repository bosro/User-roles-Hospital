// src/app/pages/departments/department.model.ts
export interface Department {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment: any;
  email?: string;
  phone?: string;
  status?: string;
  facilities?: string[];
  specialties?: string[];
  
  // Nested objects
  location?: {
    building?: string;
    floor?: number;
    roomNumbers?: string[];
  };
  
  capacity: {
    totalBeds: number;
    currentOccupancy: number;
    staffCount: number;
    beds?: number; // For UI compatibility
  };
  
  schedule?: {
    workingDays: string[];
    startTime: string;
    endTime: string;
  };
  
  contactInfo?: {
    email?: string;
    phone?: string;
    emergencyContact?: string;
  };
  
  // UI specific properties
  staff?: {
    doctors: number;
    nurses: number;
    support: number;
  };
   budget: {

    allocated: number;

    utilized: number;

  };
  
  stats?: {
    patientCount: number;
    satisfactionRate: number;
  };
}