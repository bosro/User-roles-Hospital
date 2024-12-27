import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { DialogModule } from "primeng/dialog";
import { FileUploadModule } from "primeng/fileupload";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { TagModule } from "primeng/tag";
import { TimelineModule } from "primeng/timeline";
import { AppointmentStatus, Patient, PatientStatus } from "../models/patients.model";
import { PatientService } from "../services/patient.service";
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from "primeng/api";

interface PatientStats {
  totalVisits: number;
  upcomingAppointments: number;
  prescriptions: number;
  lastVisit: Date | null;  
}

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TabViewModule,
    TimelineModule,
    ChartModule,
    TagModule,
    ButtonModule,
    TableModule,
    DialogModule,
    FileUploadModule,
    AvatarModule
  ],
  templateUrl: 'patient-profile.component.html'
})
export class PatientProfileComponent implements OnInit {
  patient: Patient | null = null;
  appointments: any[] = [];
  documents: any[] = [];
  showAppointmentDialog = false;
  
  patientStats: PatientStats = {
    totalVisits: 0,
    upcomingAppointments: 0,
    prescriptions: 0,
    lastVisit: null
  };

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadPatient(id);
    this.loadAppointments(id);
    this.loadDocuments(id);
  }

  private loadPatient(id: string) {
    this.patientService.getPatientById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.updatePatientStats();
      },
      error: () => this.showError('Failed to load patient data')
    });
  }

  private loadAppointments(id: string) {
    this.patientService.getPatientAppointments(id).subscribe({
      next: (data) => this.appointments = data,
      error: () => this.showError('Failed to load appointments')
    });
  }

  private loadDocuments(id: string) {
    this.patientService.getDocuments(id).subscribe({
      next: (data) => this.documents = data,
      error: () => this.showError('Failed to load documents')
    });
  }

  private updatePatientStats() {
    if (!this.patient) return;
    
    // Count total visits from appointments
    this.patientStats.totalVisits = this.appointments.filter(
      a => a.status === 'completed'
    ).length;

    // Count upcoming appointments
    this.patientStats.upcomingAppointments = this.appointments.filter(
      a => a.status === 'scheduled' && new Date(a.date) > new Date()
    ).length;

    // Count active prescriptions
    this.patientStats.prescriptions = this.appointments.reduce(
      (count, a) => count + (a.prescriptions?.length || 0), 
      0
    );

    // Get last visit date
    const completedAppointments = this.appointments.filter(
      a => a.status === 'completed'
    );
    if (completedAppointments.length > 0) {
      this.patientStats.lastVisit = new Date(
        Math.max(...completedAppointments.map(a => new Date(a.date).getTime()))
      );
    } else {
      this.patientStats.lastVisit = null;
    }
  }



  onDocumentUpload(event: any) {
    const files = event.files;
    this.patientService.uploadDocuments(this.patient!.id!, files).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Documents uploaded successfully'
        });
        this.loadDocuments(this.patient!.id!);
      },
      error: () => this.showError('Failed to upload documents')
    });
  }

  downloadDocument(doc: any) {
    // Implement document download
  }

  deleteDocument(doc: any) {
    // Implement document deletion
  }

  scheduleAppointment() {
    this.showAppointmentDialog = true;
  }

  getInitials(patient: Patient | null): string {
    if (!patient) return '';
    return `${patient.firstName[0]}${patient.lastName[0]}`;
  }

  calculateAge(dob: string | undefined): number {
    if (!dob) return 0;
    return Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000);
  }



  getStatusSeverity(status: PatientStatus | undefined): "success" | "danger" | "info" | "warn" | "secondary" | "contrast" | undefined {
    if (!status) return undefined;
    const severities: Record<PatientStatus, "success" | "danger" | "info" | "warn"> = {
      active: 'success',
      inactive: 'danger',
      new: 'info'
    };
    return severities[status];
  }




  getAppointmentMarkerClass(status: string): string {
    const classes: Record<string, string> = {
      completed: 'bg-green-100 text-green-600',
      scheduled: 'bg-blue-100 text-blue-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return `flex w-8 h-8 items-center justify-center rounded-full ${classes[status] || ''}`;
  }

  getAppointmentIcon(status: string): string {
    const icons: Record<string, string> = {
      completed: 'ri-check-line',
      scheduled: 'ri-calendar-line',
      cancelled: 'ri-close-line'
    };
    return icons[status] || 'ri-question-line';
  }

  getAppointmentStatusSeverity(status: AppointmentStatus): "success" | "danger" | "info" | "warn" | "secondary" | "contrast" {
    const severities: Record<AppointmentStatus, "success" | "danger" | "info"> = {
      completed: 'success',
      scheduled: 'info',
      cancelled: 'danger'
    };
    return severities[status];
  }


  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }




  getBloodGroupColor(bloodGroup: string | undefined): string {
    if (!bloodGroup) return '#f5f5f5';
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

  getAvatarColor(id: string | undefined): string {
    if (!id) return '#f5f5f5';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const index = parseInt(id.substring(id.length - 2), 16) % colors.length;
    return colors[index];
  }


}

// Would you like me to:
// 1. Complete the PatientProfileComponent implementation
// 2. Add the PatientFormComponent
