export interface Doctor {
    _id: string;
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


  export interface PatientVisit {
    id: string;
    patientId: string;
    patientName: string;
    patientImage?: string;
    date: Date;
    type: 'consultation' | 'follow-up' | 'emergency' | 'procedure';
    diagnosis: string;
    treatment: string;
    prescriptions?: string[];
    nextVisit?: Date;
    status: 'completed' | 'scheduled' | 'cancelled';
  }
  
  export interface PatientHistoryStats {
    totalPatients: number;
    totalVisits: number;
    averageVisitDuration: number;
    followUpRate: number;
  }
  
  export interface PatientAnalytics {
    ageDistribution: number[];
    visitTypes: number[];
    genderDistribution: number[];
    treatmentOutcomes: number[];
    visitTrends: {
      labels: string[];
      visits: number[];
    };
    commonDiagnoses: {
      diagnosis: string;
      count: number;
    }[];
    treatmentSuccess: {
      treatment: string;
      successRate: number;
    }[];
  }