import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Appointment, AppointmentResponse, DoctorSchedule } from '../types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  getAppointments(page: number = 1, limit: number = 10): Observable<Appointment[]> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/get?page=${page}&limit=${limit}`)
      .pipe(
        map(response => {
          // Transform data to match our client-side model
          return response.data.map(appointment => this.transformAppointment(appointment));
        })
      );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<{ success: boolean, data: Appointment }>(`${this.apiUrl}/get/${id}`)
      .pipe(
        map(response => this.transformAppointment(response.data))
      );
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    // Transform to match API expectations
    const payload = {
      patient: appointment?.patientId,
      doctor: appointment?.doctorId,
      date: appointment.date instanceof Date 
        ? appointment.date.toISOString().split('T')[0] 
        : appointment.date,
      timeSlot: appointment.timeSlot,
      type: appointment.type,
      status: appointment.status || 'Scheduled',
      notes: appointment.notes
    };

    return this.http.post<{ success: boolean, data: Appointment }>(`${this.apiUrl}/add`, payload)
      .pipe(
        map(response => this.transformAppointment(response.data))
      );
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    // Transform to match API expectations
    const payload = {
      patient: appointment.patientId || (typeof appointment.patient === 'object' ? appointment.patient._id : appointment.patient),
      doctor: appointment.doctorId || (typeof appointment.doctor === 'object' ? appointment.doctor._id : appointment.doctor),
      date: appointment.date instanceof Date 
        ? appointment.date.toISOString().split('T')[0] 
        : appointment.date,
      timeSlot: appointment.timeSlot,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes
    };

    const id = appointment.id || appointment._id;
    return this.http.put<{ success: boolean, data: Appointment }>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(response => this.transformAppointment(response.data))
      );
  }

  deleteAppointment(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/delete/${id}`);
  }

  // Get doctor schedule for a specific date
  getDoctorSchedule(doctorId: string, date: Date): Observable<DoctorSchedule> {
    const formattedDate = date instanceof Date 
      ? date.toISOString().split('T')[0] 
      : date;
    
    return this.http.get<{ success: boolean, data: DoctorSchedule }>(
      `/api/doctors/${doctorId}/schedule?date=${formattedDate}`
    ).pipe(
      map(response => response.data)
    );
  }

  // Helper to transform API response to client model
  private transformAppointment(appointment: any): Appointment {
    // Handle patient and doctor objects or IDs
    let patientId = '', patientName = '';
    let doctorId = '', doctorName = '', department = '';
    
    if (typeof appointment.patient === 'object') {
      patientId = appointment.patient._id;
      patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    } else {
      patientId = appointment.patient;
    }
    
    if (typeof appointment.doctor === 'object') {
      doctorId = appointment.doctor._id;
      doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
      department = appointment.doctor.department || '';
    } else {
      doctorId = appointment.doctor;
    }
    
    // Handle timeSlot parsing
    let startTime = '', endTime = '';
    if (appointment.timeSlot && appointment.timeSlot.includes('-')) {
      [startTime, endTime] = appointment.timeSlot.split('-');
    }
    
    return {
      id: appointment._id,
      _id: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      patientId: patientId,
      doctorId: doctorId,
      patientName: patientName,
      doctorName: doctorName,
      department: department,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      startTime: startTime,
      endTime: endTime,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
  }
}