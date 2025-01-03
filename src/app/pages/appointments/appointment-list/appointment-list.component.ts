import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppointmentService } from '../services/appointment.service';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: 'appointment-list.component.html'
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading = false;
  searchQuery = '';
  selectedStatus = '';
  selectedDepartment = '';

  statusFilters = [
    { label: 'All Statuses', value: '' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'No Show', value: 'no-show' }
  ];

  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Orthopedics', value: 'orthopedics' },
    { label: 'Pediatrics', value: 'pediatrics' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filterAppointments();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load appointments'
        });
        this.loading = false;
      }
    });
  }

  filterAppointments() {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.searchQuery || 
        appointment.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || 
        appointment.status === this.selectedStatus;
      
      const matchesDepartment = !this.selectedDepartment || 
        appointment.department === this.selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

getStatusSeverity(status: AppointmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  const severities: Record<AppointmentStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
    'scheduled': 'info',
    'confirmed': 'success',
    'in-progress': 'warn',
    'completed': 'success',
    'cancelled': 'danger',
    'no-show': 'secondary'
  };
  return severities[status] || 'info';
}
  navigateToNewAppointment() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }



  editAppointment(appointment: Appointment) {
    if (!appointment.id) return;
    this.router.navigate(['../edit', appointment.id], { relativeTo: this.route });
  }

  confirmDelete(appointment: Appointment) {
    if (!appointment.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid appointment ID'
      });
      return;
    }
  
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this appointment?',
      accept: () => {
        this.appointmentService.deleteAppointment(appointment.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Appointment deleted successfully'
            });
            this.loadAppointments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete appointment'
            });
          }
        });
      }
    });
  }
}