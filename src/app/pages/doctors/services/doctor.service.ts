import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor,DoctorSchedule } from '../doctors.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  createDoctor(doctor: Omit<Doctor, 'id'>): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, doctor);
  }

  updateDoctor(id: string, doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/${id}`, doctor);
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDoctorSchedule(doctorId: string, date: Date): Observable<DoctorSchedule> {
    return this.http.get<DoctorSchedule>(
      `${this.apiUrl}/${doctorId}/schedule?date=${date.toISOString()}`
    );
  }

  updateDoctorSchedule(
    doctorId: string, 
    schedule: Partial<DoctorSchedule>
  ): Observable<DoctorSchedule> {
    return this.http.put<DoctorSchedule>(
      `${this.apiUrl}/${doctorId}/schedule`,
      schedule
    );
  }

  updateDoctorStatus(id: string, status: Doctor['status']): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }
}
