// src/app/pages/doctors/components/doctor-list/doctor-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { MultiSelectModule } from 'primeng/multiselect';
import { Doctor } from '../../doctors.model';
import { DoctorService } from '../../services/doctor.service';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TagModule,
    AvatarModule,
    MultiSelectModule,
  ],
  templateUrl: 'doctors-list.component.html',
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  loading = false;

  @ViewChild('dt') dt!: Table;
  
  // Stats
  totalDoctors = 0;
  activeDoctors = 0;
  onDutyToday = 0;
  onLeave = 0;

  // Filters
  departments: any[] = [];
  specializations: any[] = [];
  selectedDepartments: string[] = [];
  selectedSpecializations: string[] = [];

  constructor(
    private doctorService: DoctorService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading = false;
      },
    });
  }

  updateStats() {
    this.totalDoctors = this.doctors.length;
    this.activeDoctors = this.doctors.filter(
      (d) => d.status === 'active'
    ).length;
    this.onLeave = this.doctors.filter((d) => d.status === 'on-leave').length;
    this.onDutyToday = this.calculateOnDutyToday();
  }

  calculateOnDutyToday(): number {
    const today = new Date().getDay();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return this.doctors.filter(
      (d) => d.status === 'active' && d.workingDays.includes(dayNames[today])
    ).length;
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const severities: Record<string, "success" | "danger" | "warn"> = {
      'active': 'success',
      'inactive': 'danger',
      'on-leave': 'warn'
    };
    return severities[status] || 'info';
  }
  formatWorkingDays(days: string[]): string {
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(', ');
  }

  filterByDepartment() {
    // Implement department filtering
  }

  filterBySpecialization() {
    // Implement specialization filtering
  }

  onSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }

  viewProfile(doctor: Doctor) {
    this.router.navigate(['profile', doctor.id], { relativeTo: this.route });
  }

  viewSchedule(doctor: Doctor) {
    this.router.navigate(['schedule'], {
      relativeTo: this.route,
      queryParams: { doctorId: doctor.id },
    });
  }

  editDoctor(doctor: Doctor) {
    this.router.navigate(['edit', doctor.id], { relativeTo: this.route });
  }

  confirmDelete(doctor: Doctor) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?`,
      accept: () => {
        this.deleteDoctor(doctor);
      },
    });
  }

  private deleteDoctor(doctor: Doctor) {
    this.doctorService.deleteDoctor(doctor.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Doctor deleted successfully',
        });
        this.loadDoctors();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete doctor',
        });
      },
    });
  }
}
