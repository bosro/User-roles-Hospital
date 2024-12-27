export interface Appointment {
    id?: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    department: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    type: AppointmentType;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export type AppointmentStatus = 
    | 'scheduled' 
    | 'confirmed' 
    | 'in-progress' 
    | 'completed' 
    | 'cancelled' 
    | 'no-show';
  
  export type AppointmentType = 
    | 'regular' 
    | 'follow-up' 
    | 'emergency' 
    | 'consultation' 
    | 'procedure';
  
  export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
  }
  
  export interface DoctorSchedule {
    doctorId: string;
    doctorName: string;
    department: string;
    availableSlots: TimeSlot[];
  }
  