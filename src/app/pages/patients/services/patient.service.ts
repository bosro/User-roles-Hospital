import { map, Observable } from "rxjs";
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

  getPatients(params: any): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/all`, { params }).pipe(
      map((response: any) => {
        // Transform the API response to match the expected format in the component
        if (response.success && response.data) {
          return response.data.map((patient: any) => {
            // Add missing properties required by the template
            return {
              ...patient,
              bloodGroup: patient.bloodGroup || 'O+', // Default value
              lastVisit: patient.lastVisit || new Date(patient.updatedAt).toISOString(), // Use updatedAt as lastVisit
              status: patient.admitted ? 'active' : 'inactive' // Determine status based on admitted field
            };
          });
        }
        return [];
      })
    );
  }

  getPatientById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          const patient = response.data;
          
          // Transform the API response to match the form structure
          return {
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: new Date(patient.dateOfBirth),
            gender: patient.gender?.toLowerCase(),
            bloodGroup: patient.bloodGroup || '',
            phone: patient.contactInfo?.phone || '',
            email: patient.contactInfo?.email || '',
            address: patient.contactInfo?.address || '',
            medicalHistory: {
              allergies: patient.allergies || [],
              conditions: patient.medicalHistory?.map((h: any) => h.condition) || [],
              surgeries: patient.surgeries || [],
              medications: patient.medications?.map((m: any) => m.name) || []
            },
            insurance: {
              provider: patient.insurance?.provider || '',
              policyNumber: patient.insurance?.policyNumber || '',
              groupNumber: patient.insurance?.groupNumber || '',
              expiryDate: patient.insurance?.validTill ? new Date(patient.insurance.validTill) : null
            }
          };
        }
        return {};
      })
    );
  }

  createPatient(patientData: any): Observable<any> {
    // Transform the form data to match the API expected format
    const apiPatient = this.transformPatientForApi(patientData);
    return this.http.post<any>(`${this.apiUrl}/add`, apiPatient);
  }

  updatePatient(id: string, patientData: any): Observable<any> {
    // Transform the form data to match the API expected format
    const apiPatient = this.transformPatientForApi(patientData);
    return this.http.put<any>(`${this.apiUrl}/edit/${id}`, apiPatient);
  }




  private transformPatientForApi(formData: any): any {
    // Transform form data structure to API expected structure
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth?.toISOString(),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      contactInfo: {
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      },
      allergies: formData.medicalHistory?.allergies || [],
      medicalHistory: (formData.medicalHistory?.conditions || []).map((condition: string) => ({
        condition: condition,
        diagnosedOn: new Date().toISOString(),
        status: 'Active'
      })),
      medications: (formData.medicalHistory?.medications || []).map((name: string) => ({
        name: name,
        dosage: '',
        prescribedBy: ''
      })),
      surgeries: formData.medicalHistory?.surgeries || [],
      insurance: {
        provider: formData.insurance?.provider,
        policyNumber: formData.insurance?.policyNumber,
        groupNumber: formData.insurance?.groupNumber,
        validTill: formData.insurance?.expiryDate?.toISOString()
      }
    };
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

  deletePatient(patientId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${patientId}`);
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
