export interface Department {
  id?: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  location: {
    building: string;
    floor: string;
    roomNumbers: string[];
  };
  capacity: {
    beds: number;
    currentOccupancy: number;
    staffCount: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  operatingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  facilities: string[];
  specialties: string[];
  stats: {
    patientCount: number;
    appointmentsPerDay: number;
    averageWaitTime: number;
    satisfactionRate: number;
  };
  budget: {
    allocated: number;
    utilized: number;
    fiscalYear: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact: string;
  };
  staff: {
    doctors: number;
    nurses: number;
    technicians: number;
    support: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
