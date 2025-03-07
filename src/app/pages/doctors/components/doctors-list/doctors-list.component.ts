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
  templateUrl: './doctors-list.component.html',
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
  displayViewDialog = false;

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
        this.initializeFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load doctors'
        });
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

  initializeFilters() {
    // Extract unique departments
    const uniqueDepartments = new Set<string>();
    // Extract unique specializations
    const uniqueSpecializations = new Set<string>();
    
    this.doctors.forEach(doctor => {
      if (doctor.department) uniqueDepartments.add(doctor.department);
      if (doctor.specialization) uniqueSpecializations.add(doctor.specialization);
    });
    
    // Convert to array of options for PrimeNG multiselect
    this.departments = Array.from(uniqueDepartments)
      .filter(dept => dept) // Remove null/undefined
      .map(dept => ({ label: dept, value: dept }));
    
    this.specializations = Array.from(uniqueSpecializations)
      .filter(spec => spec) // Remove null/undefined
      .map(spec => ({ label: spec, value: spec }));
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
    
    const todayName = dayNames[today];
    
    return this.doctors.filter(
      (d) => d.status === 'active' && 
             d.workingDays && 
             d.workingDays.some(day => day.toLowerCase() === todayName)
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
    if (!days || days.length === 0) return 'Not specified';
    
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(', ');
  }

  filterByDepartment() {
    if (this.selectedDepartments.length === 0) {
      // Reset filter if nothing selected
      this.dt.filter(null, 'department', 'equals');
      return;
    }
    this.dt.filter(this.selectedDepartments, 'department', 'in');
  }

  filterBySpecialization() {
    if (this.selectedSpecializations.length === 0) {
      // Reset filter if nothing selected
      this.dt.filter(null, 'specialization', 'equals');
      return;
    }
    this.dt.filter(this.selectedSpecializations, 'specialization', 'in');
  }

  onSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(searchValue, 'contains');
  }

  viewProfile(doctor: Doctor) {
    // Navigate to profile page with doctor ID
    this.router.navigate(['../profile', doctor._id], { relativeTo: this.route });
  }

  viewSchedule(doctor: Doctor) {
    // Navigate to schedule page with doctor ID as query param
    this.router.navigate(['../schedule'], {
      relativeTo: this.route,
      queryParams: { doctorId: doctor._id },
    });
  }

  editDoctor(doctor: Doctor) {
    // Navigate to edit page with doctor ID
    this.router.navigate(['../edit', doctor._id], { relativeTo: this.route });
  }

  confirmDelete(doctor: Doctor) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?`,
      accept: () => {
        this.deleteDoctor(doctor);
      },
    });
  }

  // deleteDoctor(doctor: Doctor) {
  //   this.confirmationService.confirm({
  //     message: `Are you sure you want to delete Dr`,
  //     accept: () => {
  //       this.doctorService.deleteDoctor(doctor._id).subscribe({
  //         next: () => {
  //           this.messageService.add({
  //             severity: 'success',
  //             summary: 'Success',
  //             detail: 'User promoted to Admin successfully'
  //           });
  //           this.loadDoctors();
  //         },
  //         error: (err) => {
  //           console.error('Failed to promote user:', err);
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'Failed to delete doctor'
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

  deleteDoctor(doctor: Doctor) {
    if (confirm(`Are you sure you want to delete ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`)) {
      this.loading = true;
      this.doctorService.deleteDoctor(doctor._id).subscribe({
        next: () => {
          alert('Doctor  deleted successfully');
          this.loadDoctors();
          this.updateStats();
        },
        error: (err) => {
          console.error('Failed to delete Admin:', err);
          alert('Failed to delete Admin: ' + (err.message || 'Unknown error'));
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  // private deleteDoctor(doctor: Doctor) {
  //   this.doctorService.deleteDoctor(doctor._id).subscribe({
  //     next: () => {
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: 'Doctor deleted successfully',
  //       });
  //       this.loadDoctors(); // Reload the list after deletion
  //     },
  //     error: (error) => {
  //       console.error('Error deleting doctor:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to delete doctor'
  //       });
  //     },
  //   });
  // }
}