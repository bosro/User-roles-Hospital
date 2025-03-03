import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Doctor, DoctorSchedule, PatientVisit } from '../doctors.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<{ success: boolean; message: string; data: Doctor[] }>(`${this.apiUrl}/doctors`)
      .pipe(map(response => response.data));
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<{ success: boolean; message: string; data: Doctor }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createDoctor(doctor: Omit<Doctor, 'id'>): Observable<Doctor> {
    return this.http.post<{ success: boolean; message: string; data: Doctor }>(this.apiUrl, doctor)
      .pipe(map(response => response.data));
  }

  updateDoctor(id: string, doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<{ success: boolean; message: string; data: Doctor }>(`${this.apiUrl}/${id}`, doctor)
      .pipe(map(response => response.data));
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`)
      .pipe(map(() => {}));
  }

  getDoctorSchedule(doctorId: string, date: Date): Observable<DoctorSchedule> {
    return this.http.get<{ success: boolean; message: string; data: DoctorSchedule }>(
      `${this.apiUrl}/${doctorId}/schedule?date=${date.toISOString()}`
    ).pipe(map(response => response.data));
  }

  updateDoctorSchedule(
    doctorId: string, 
    schedule: Partial<DoctorSchedule>
  ): Observable<DoctorSchedule> {
    return this.http.put<{ success: boolean; message: string; data: DoctorSchedule }>(
      `${this.apiUrl}/${doctorId}/schedule`,
      schedule
    ).pipe(map(response => response.data));
  }

  updateDoctorStatus(id: string, status: Doctor['status']): Observable<void> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map(() => {}));
  }

  getPatientHistoryStats(doctorId: string): Observable<any> {
    return this.http.get<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${doctorId}/patient-history/stats`)
      .pipe(map(response => response.data));
  }

  getDoctorPatientVisits(doctorId: string, params?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    type?: string;
  }): Observable<PatientVisit[]> {
    return this.http.get<{ success: boolean; message: string; data: PatientVisit[] }>(
      `${this.apiUrl}/${doctorId}/patient-visits`,
      { params: this.createQueryParams(params) }
    ).pipe(map(response => response.data));
  }

  getPatientAnalytics(doctorId: string): Observable<any> {
    return this.http.get<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/${doctorId}/patient-analytics`)
      .pipe(map(response => response.data));
  }

  getPatientMedicalRecords(visitId: string): Observable<any> {
    return this.http.get<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/patient-visits/${visitId}/medical-records`)
      .pipe(map(response => response.data));
  }

  scheduleFollowUp(visitId: string, appointment: any): Observable<any> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/patient-visits/${visitId}/follow-up`,
      appointment
    ).pipe(map(response => response.data));
  }

  private createQueryParams(params: any): { [key: string]: string } {
    const queryParams: { [key: string]: string } = {};
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          if (params[key] instanceof Date) {
            queryParams[key] = params[key].toISOString();
          } else {
            queryParams[key] = params[key].toString();
          }
        }
      });
    }
    
    return queryParams;
  }
}