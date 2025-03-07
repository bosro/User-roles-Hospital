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
import { Appointment, AppointmentStatus, AppointmentType } from '../models/appointment.model';

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
  templateUrl: './appointment-list.component.html'
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: any[] = [];
  loading = false;
  searchQuery = '';
  selectedStatus = '';
  selectedDepartment = '';
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  statusFilters = [
    { label: 'All Statuses', value: '' },
    { label: 'Scheduled', value: 'Scheduled' }, // Changed to match API case
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'No Show', value: 'No Show' }
  ];

  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'Cardiology' }, // Changed to match API case
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Orthopedics', value: 'Orthopedics' },
    { label: 'Pediatrics', value: 'Pediatrics' },
    { label: 'General', value: 'General' },
    { label: 'Follow-up', value: 'Follow-up' } // Added to match API type
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
    this.appointmentService.getAppointments(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response); // Log the raw response
        
        // First check if response exists
        if (!response) {
          console.error('Response is null or undefined');
          this.handleError('Empty response from server');
          return;
        }
        
        try {
          // Check if response is a string (needs parsing)
          if (typeof response === 'string') {
            try {
              response = JSON.parse(response);
              console.log('Parsed response:', response);
            } catch (e) {
              console.error('Failed to parse response string:', e);
              this.handleError('Invalid JSON response from server');
              return;
            }
          }
          
          // Now check if the required properties exist
          if (response.success !== true) {
            console.error('Response success is not true:', response.success);
            this.handleError('Server reported unsuccessful operation');
            return;
          }
          
          if (!Array.isArray(response.data)) {
            console.error('Response data is not an array:', response.data);
            this.handleError('Invalid data format: expected an array');
            return;
          }
          
          // Process the data
          this.appointments = response.data.map((item: any) => {
            // Handle case where item might be null or undefined
            if (!item) {
              console.warn('Found null/undefined item in response data');
              return null;
            }
            
            // Extract time slot parts if available and valid
            let startTime = 'Not specified';
            let endTime = 'Not specified';
            
            if (item.timeSlot && item.timeSlot !== 'undefined - undefined') {
              const parts = item.timeSlot.split('-').map((t: string) => t.trim());
              if (parts[0] && parts[0] !== 'undefined') startTime = parts[0];
              if (parts.length > 1 && parts[1] !== 'undefined') endTime = parts[1];
            }
            
            // Create the appointment object matching your interface
            return {
              id: item._id,
              _id: item._id,
              patient: item.patient || null,
              doctor: item.doctor || null,
              patientId: item.patient?._id,
              doctorId: item.doctor?._id,
              patientName: item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : 'No Patient',
              doctorName: item.doctor ? `${item.doctor.firstName} ${item.doctor.lastName}` : 'No Doctor',
              department: item.doctor?.specialty || item.type || 'General',
              date: item.date,
              timeSlot: item.timeSlot && item.timeSlot !== 'undefined - undefined' ? item.timeSlot : 'Not specified',
              startTime: startTime,
              endTime: endTime,
              type: item.type || 'Consultation',
              status: item.status || 'Scheduled',
              notes: item.notes || '',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            };
          }).filter(Boolean); // Remove any null entries
          
          console.log('Processed appointments:', this.appointments);
          
          // Set pagination data
          if (response.pagination) {
            this.totalRecords = response.pagination.total || 0;
          }
          
          // Always call filterAppointments even if appointments is empty
          this.filterAppointments();
          
        } catch (error) {
          console.error('Error processing response:', error);
          this.handleError('Error processing server response: ' + (error as Error).message);
        } finally {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('API Error:', error);
        this.handleError('Failed to load appointments: ' + (error.message || 'Unknown error'));
      }
    });
  }
  
  // Helper method to handle errors consistently
  private handleError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
    this.loading = false;
    this.appointments = [];
    this.filteredAppointments = [];
  }

  filterAppointments() {
    // Make a copy of appointments before filtering to avoid mutation issues
    const appointmentsToFilter = [...this.appointments];
    
    this.filteredAppointments = appointmentsToFilter.filter(appointment => {
      // Search query filter (case insensitive)
      const matchesSearch = !this.searchQuery || 
        (appointment.patientName?.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
         appointment.doctorName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
         appointment.department?.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      // Status filter - use exact match, not lowercase comparison
      const matchesStatus = !this.selectedStatus || 
        appointment.status === this.selectedStatus;
      
      // Department filter - use exact match, not lowercase comparison
      const matchesDepartment = !this.selectedDepartment || 
        appointment.department === this.selectedDepartment;
  
      return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    // Debug: If no filtered appointments, log why
    if (this.filteredAppointments.length === 0 && this.appointments.length > 0) {
      console.log('No appointments matched filters:', {
        searchQuery: this.searchQuery,
        selectedStatus: this.selectedStatus,
        selectedDepartment: this.selectedDepartment
      });
    }
  }

  getStatusSeverity(status: AppointmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    // Handle null or undefined status
    if (!status) return 'info';
    
    // Map status to severity regardless of case
    const statusMap: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'scheduled': 'info',
      'confirmed': 'success',
      'in progress': 'warn',
      'completed': 'success',
      'cancelled': 'danger',
      'no show': 'secondary'
    };
    
    return statusMap[status.toLowerCase()] || 'info';
  }

  navigateToNewAppointment() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }

  editAppointment(appointment: Appointment) {
    if (!appointment.id && !appointment._id) return;
    this.router.navigate(['../view', appointment.id || appointment._id], { relativeTo: this.route });
  }

  confirmDelete(appointment: Appointment) {
    const id = appointment.id || appointment._id;
    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid appointment ID'
      });
      return;
    }
  
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this appointment?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appointmentService.deleteAppointment(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Appointment deleted successfully'
            });
            this.loadAppointments();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete appointment: ' + (error.message || 'Unknown error')
            });
          }
        });
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadAppointments();
  }
}