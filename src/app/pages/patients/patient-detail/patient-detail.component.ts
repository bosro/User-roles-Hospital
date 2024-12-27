import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Patient } from '../models/patients.model';
import { PatientService } from '../services/patient.service';

interface TabChangeEvent {
  index: number;
  originalEvent: Event;
}

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TabViewModule,
    TimelineModule,
    TagModule,
    TableModule,
    FileUploadModule,
    AvatarModule,
    ProgressSpinnerModule
  ],
  templateUrl: 'patient-detail.component.html'
})

export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  isLoading = false;
  activeTab = 'overview';
  medicalHistory: Array<{
    type: string;
    date: string;
    description: string;
    category: string;
  }> = [];
  appointments: any[] = [];
  prescriptions: any[] = [];
  documents: Array<{
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }> = [];
  activeIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPatient();
  }

  
  onTabChange(event: TabChangeEvent): void {
    const tabMap: Record<number, string> = {
      0: 'overview',
      1: 'history',
      2: 'documents'
    };
    
    this.activeTab = tabMap[event.index] || 'overview';
  }
  
  
    switchTab(tab: string): void {
      const tabIndexMap: Record<string, number> = {
        'overview': 0,
        'history': 1,
        'documents': 2
      };
      this.activeIndex = tabIndexMap[tab] || 0;
    }

  private loadPatient(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.isLoading = true;
      this.patientService.getPatientById(patientId).subscribe({
        next: (patient) => {
          this.patient = patient;
          this.loadPatientData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading patient:', error);
          this.isLoading = false;
        }
      });
    }
  }

  private loadPatientData(): void {
    if (this.patient?.id) {
      // Load medical history
      this.patientService.getPatientHistory(this.patient.id).subscribe({
        next: (history) => {
          this.medicalHistory = history;
        }
      });

      // Load appointments
      this.patientService.getPatientAppointments(this.patient.id).subscribe({
        next: (appointments) => {
          this.appointments = appointments;
        }
      });

      // Load documents
      this.patientService.getDocuments(this.patient.id).subscribe({
        next: (documents) => {
          this.documents = documents;
        }
      });
    }
  }

  getStatusSeverity(status?: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const severities: Record<string, "success" | "info" | "warn" | "danger"> = {
      active: 'success',
      inactive: 'danger',
      pending: 'warn',
      new: 'info'
    };
    return status ? severities[status] : undefined;
  }

  getCategorySeverity(category: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    const severities: Record<string, "success" | "info" | "warn" | "danger"> = {
      condition: 'info',
      surgery: 'warn',
      medication: 'success',
      allergy: 'danger'
    };
    return severities[category] || 'info';
  }

  uploadDocument(event: any): void {
    const files = event.files;
    if (files && this.patient?.id) {
      this.patientService.uploadDocuments(this.patient.id, files).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document uploaded successfully'
          });
          this.loadPatientData();
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload document'
          });
        }
      });
    }
  }

  downloadDocument(doc: any): void {
    // Implement document download
    if (this.patient?.id) {
      this.patientService.downloadDocument(this.patient.id, doc.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading document:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to download document'
          });
        }
      });
    }
  }

  deleteDocument(doc: any): void {
    if (this.patient?.id) {
      this.patientService.deleteDocument(this.patient.id, doc.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document deleted successfully'
          });
          this.loadPatientData();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete document'
          });
        }
      });
    }
  }

  // Your existing utility methods
  getInitials(patient: Patient): string {
    return `${patient.firstName[0]}${patient.lastName[0]}`;
  }

  getAvatarColor(id: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const index = parseInt(id.substring(id.length - 2), 16) % colors.length;
    return colors[index];
  }

  getBloodGroupColor(bloodGroup: string): string {
    const colors: Record<string, string> = {
      'A+': '#e3f2fd',
      'A-': '#e8eaf6',
      'B+': '#f3e5f5',
      'B-': '#fce4ec',
      'AB+': '#f1f8e9',
      'AB-': '#fff3e0',
      'O+': '#e0f2f1',
      'O-': '#fff8e1'
    };
    return colors[bloodGroup] || '#f5f5f5';
  }

  calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
