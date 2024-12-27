export interface Doctor {
    id?: string;
    prefix: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialization: string;
    department: string;
    qualification: string;
    experience: number;
    licenseNumber: string;
    joiningDate: Date;
    status: 'active' | 'inactive' | 'on-leave';
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
    consultationFee: number;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    profileImage?: string;
    about?: string;
    expertise?: string[];
    languages?: string[];
  }
  
  export interface DoctorSchedule {
    doctorId: string;
    date: Date;
    slots: TimeSlot[];
  }
  
  export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked' | 'blocked';
    appointmentId?: string;
  }