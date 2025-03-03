import { ConfirmationService, MessageService } from 'primeng/api';
import { PatientService } from '../services/patient.service';
import { Component, OnInit } from '@angular/core';
import { Patient } from '../models/patients.model';
import { Card } from 'primeng/card';
import { Table, TableModule } from 'primeng/table';
import { Avatar } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { Calendar } from 'primeng/calendar';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownModule } from "primeng/dropdown";
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface Filters {
  search: string;
  dateRange: Date[] | null;
  bloodGroup: string | null;
  status: string | null;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    Card,
    TableModule,
    Avatar,
    FormsModule,
    Calendar,
    Tag,
    Button,
    CommonModule,
    RouterModule,
    DropdownModule,
    DialogModule,
    TabViewModule,
    ChipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: 'patient-list.component.html',
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];
  loading = false;
  today = new Date();
  displayPatientDetails = false;
  selectedPatient: any = null;

  stats = {
    totalPatients: 0,
    todayAppointments: 0,
    newPatients: 0,
    activePatients: 0,
  };

  filters: Filters = {
    search: '',
    dateRange: null,
    bloodGroup: null,
    status: null,
  };

  bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
  ];

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'New', value: 'new' },
  ];

  constructor(
    private patientService: PatientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadStats();
  }

  loadPatients(): void {
    this.loading = true;
    const params = this.getFilterParams();

    this.patientService.getPatients(params).subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
        this.updateStats();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patients',
        });
        this.loading = false;
      },
    });
  }

  private updateStats() {
    // Calculate stats based on loaded patients
    this.stats.totalPatients = this.patients.length;
    this.stats.activePatients = this.patients.filter(p => p.admitted).length;
    
    // Calculate new patients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    this.stats.newPatients = this.patients.filter(p => 
      new Date(p.createdAt) >= startOfMonth
    ).length;
    
    // Placeholder for appointments (would come from a different API endpoint in real app)
    this.stats.todayAppointments = Math.floor(Math.random() * 10) + 1; // Placeholder value
  }

  private loadStats() {
    // In a real app, you would load stats from an API
    // For now, we'll calculate them from the loaded patients in updateStats()
  }

  private getFilterParams(): any {
    const params: any = {};

    if (this.filters.search) {
      params.search = this.filters.search;
    }

    if (
      this.filters.dateRange &&
      this.filters.dateRange[0] &&
      this.filters.dateRange[1]
    ) {
      params.startDate = this.filters.dateRange[0].toISOString();
      params.endDate = this.filters.dateRange[1].toISOString();
    }

    if (this.filters.bloodGroup) {
      params.bloodGroup = this.filters.bloodGroup;
    }

    if (this.filters.status) {
      params.status = this.filters.status;
      if (this.filters.status === 'active') {
        params.admitted = true;
      } else if (this.filters.status === 'inactive') {
        params.admitted = false;
      }
    }

    return params;
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value.length >= 3 || target.value.length === 0) {
      this.loadPatients();
    }
  }

  filterPatients() {
    this.loadPatients();
  }

  getInitials(patient: Patient): string {
    return `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`;
  }

  calculateAge(dob: string): number {
    return Math.floor(
      (new Date().getTime() - new Date(dob).getTime()) / 31557600000
    );
  }

  getTimeSince(date: string): string {
    const days = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 86400000
    );
    return `${days} days ago`;
  }

  getStatusSeverity(
    status: string
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      active: 'success',
      Active: 'success',
      inactive: 'danger',
      Inactive: 'danger',
      new: 'info',
      New: 'info',
      pending: 'warn',
      Chronic: 'warn',
    };
    return severities[status] || 'secondary';
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
      'O-': '#fff8e1',
    };
    return colors[bloodGroup] || '#f5f5f5';
  }

  getAvatarColor(id: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const index = parseInt(id.substring(id.length - 2), 16) % colors.length;
    return colors[index];
  }

  viewDetails(patientId: string): void {
    // Find the patient and show the details dialog
    this.selectedPatient = this.patients.find(p => p._id === patientId);
    if (this.selectedPatient) {
      this.displayPatientDetails = true;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Patient details not found',
      });
    }
  }

  editPatient(patientId: string): void {
    this.router.navigate(['/patients/edit', patientId]);
  }

  confirmDelete(patient: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${patient.firstName} ${patient.lastName}'s record? This action cannot be undone.`,
      accept: () => {
        this.deletePatient(patient._id);
      }
    });
  }

  deletePatient(patientId: string): void {
    this.patientService.deletePatient(patientId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Patient deleted successfully',
        });
        this.loadPatients();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete patient',
        });
      },
    });
  }

  printPatientDetails(): void {
    // In a real app, you'd implement proper printing
    window.print();
  }
}