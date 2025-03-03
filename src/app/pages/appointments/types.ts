// models/appointment.model.ts
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show' | 
                               'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'Regular' | 'Follow-up' | 'Emergency' | 'Consultation' | 'Procedure' |
                             'regular' | 'follow-up' | 'emergency' | 'consultation' | 'procedure';

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  department?: string;
}

export interface Appointment {
  id?: string;  // For client-side use (convert from _id)
  _id?: string; // From backend
  patient: string | Patient;
  doctor: string | Doctor;
  patientId?: string; // For client-side form
  doctorId?: string;  // For client-side form
  patientName?: string; // Derived for display
  doctorName?: string;  // Derived for display
  department?: string;  // From doctor info
  date: string | Date;
  timeSlot: string;
  startTime?: string; // Derived from timeSlot
  endTime?: string;   // Derived from timeSlot
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DoctorSchedule {
  availableSlots: TimeSlot[];
}