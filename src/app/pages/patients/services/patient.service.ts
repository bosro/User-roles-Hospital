import { Observable } from "rxjs";
import { Appointment, Patient, Prescription } from "../models/patients.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";

export interface PatientHistory {
  type: string;
  date: string;
  description: string;
  category: string;
}

export interface PatientDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(params?: any): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl, { params });
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  getPatientAppointments(id: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/${id}/appointments`);
  }

  createAppointment(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.apiUrl}/${appointment.patientId}/appointments`, 
      appointment
    );
  }

  updateAppointment(patientId: string, appointmentId: string, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}/${patientId}/appointments/${appointmentId}`,
      appointment
    );
  }

  getPatientHistory(id: string): Observable<PatientHistory[]> {
    return this.http.get<PatientHistory[]>(`${this.apiUrl}/${id}/medical-history`);
  }

  getPatientMedicalHistory(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/medical-history`);
  }

  addPrescription(patientId: string, appointmentId: string, prescription: Prescription): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${patientId}/appointments/${appointmentId}/prescriptions`,
      prescription
    );
  }

  uploadDocuments(patientId: string, files: File[]): Observable<PatientDocument[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<PatientDocument[]>(
      `${this.apiUrl}/${patientId}/documents`, 
      formData
    );
  }

  getDocuments(patientId: string): Observable<PatientDocument[]> {
    return this.http.get<PatientDocument[]>(`${this.apiUrl}/${patientId}/documents`);
  }

  downloadDocument(patientId: string, documentId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${patientId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
  }

  deleteDocument(patientId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${patientId}/documents/${documentId}`
    );
  }
}
