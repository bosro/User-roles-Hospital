// src/app/pages/appointments/appointment-calendar/appointment-calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from '../services/appointment.service';
import { Appointment, AppointmentStatus, AppointmentType } from '../models/appointment.model';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CalendarModule,
    ButtonModule,
    DialogModule,
    CardModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    FullCalendarModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: 'appointment-calendar.component.html'
})
export class AppointmentCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions;
  appointments: any[] = [];
  upcomingAppointments: any[] = [];
  selectedAppointment: Appointment | null = null;
  displayEventDialog = false;
  selectedDepartment: string = '';
  currentPage = 1;
  pageSize = 100; // Increased to get more appointments for calendar
  loading = false;

  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Orthopedics', value: 'Orthopedics' },
    { label: 'Pediatrics', value: 'Pediatrics' },
    { label: 'General', value: 'General' },
    { label: 'Follow-up', value: 'Follow-up' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute 
  ) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      eventClick: this.handleEventClick.bind(this),
      events: [],
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      height: 'auto',
      allDaySlot: false,
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00'
    };
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAppointments(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          // Map the API response data to your Appointment interface
          this.appointments = response.data.map((item: any) => {
            // Handle time slot and date formatting
            let appointmentDate = new Date(item.date);
            const today = new Date();
            
            // If date is invalid, use today's date
            if (isNaN(appointmentDate.getTime())) {
              appointmentDate = today;
            }
            
            // Format as YYYY-MM-DD
            const formattedDate = appointmentDate.toISOString().split('T')[0];
            
            // Process time slot
            let startTime = '09:00:00';
            let endTime = '10:00:00';
            
            if (item.timeSlot && item.timeSlot !== 'undefined - undefined') {
              const parts = item.timeSlot.split('-').map((t :any)=> t.trim());
              if (parts[0] && parts[0] !== 'undefined') {
                startTime = parts[0].includes(':') ? parts[0] : `${parts[0]}:00`;
                // Make sure time has seconds
                if (startTime.split(':').length === 2) {
                  startTime = `${startTime}:00`;
                }
              }
              if (parts.length > 1 && parts[1] !== 'undefined') {
                endTime = parts[1].includes(':') ? parts[1] : `${parts[1]}:00`;
                // Make sure time has seconds
                if (endTime.split(':').length === 2) {
                  endTime = `${endTime}:00`;
                }
              }
            }
            
            // Create the appointment object
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
              date: formattedDate,
              fullDate: appointmentDate,
              timeSlot: item.timeSlot && item.timeSlot !== 'undefined - undefined' ? 
                item.timeSlot : `${startTime.split(':')[0]}:${startTime.split(':')[1]} - ${endTime.split(':')[0]}:${endTime.split(':')[1]}`,
              startTime: startTime,
              endTime: endTime,
              type: item.type as AppointmentType || 'Consultation',
              status: item.status as AppointmentStatus || 'Scheduled',
              notes: item.notes || '',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            };
          });
          
          console.log('Processed appointments:', this.appointments);
          
          // Update the calendar and sidebar
          this.updateCalendarEvents();
          this.updateUpcomingAppointments();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid response format from server'
          });
          this.appointments = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load appointments: ' + (error.message || 'Unknown error')
        });
        this.loading = false;
        this.appointments = [];
      }
    });
  }

  private updateCalendarEvents() {
    const events = this.appointments
      .filter(app => !this.selectedDepartment || app.department === this.selectedDepartment)
      .map(app => {
        // Create proper start and end datetime strings
        const startDateTime = `${app.date}T${app.startTime}`;
        const endDateTime = `${app.date}T${app.endTime}`;
        
        return {
          id: app.id,
          title: `${app.patientName} - ${app.type}`,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: this.getStatusColor(app.status),
          borderColor: this.getStatusColor(app.status),
          textColor: '#FFFFFF',
          extendedProps: {
            doctor: app.doctorName,
            department: app.department,
            status: app.status
          }
        };
      });
    
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
    
    console.log('Calendar events updated:', events);
  }

  private updateUpcomingAppointments() {
    const now = new Date();
    this.upcomingAppointments = this.appointments
      .filter(app => {
        const appDate = new Date(`${app.date}T${app.startTime}`);
        return appDate > now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
    
    console.log('Upcoming appointments:', this.upcomingAppointments);
  }

  handleEventClick(info: any) {
    const appointmentId = info.event.id;
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment) {
      this.selectedAppointment = appointment;
      this.displayEventDialog = true;
    }
  }

  navigateToNewAppointment() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }

  editAppointment(appointment: Appointment) {
    if (!appointment) return; 
    this.router.navigate(['../edit', appointment.id], { relativeTo: this.route });
  }

  confirmDelete(appointment: Appointment) {
    if (!appointment) return; 
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this appointment?',
      accept: () => {
        if (!appointment.id) return; 
        this.appointmentService.deleteAppointment(appointment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Appointment deleted successfully'
            });
            this.loadAppointments();
            this.displayEventDialog = false;
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

  filterAppointments() {
    this.updateCalendarEvents();
  }

  getStatusClass(status: AppointmentStatus): string {
    if (!status) return '';
    
    const statusMap: {[key: string]: string} = {
      'Scheduled': 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
      'Confirmed': 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
      'In Progress': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
      'Completed': 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium',
      'Cancelled': 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
      'No Show': 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
  }

  getStatusColor(status: AppointmentStatus): string {
    if (!status) return '#3B82F6'; // Default blue
    
    const statusColorMap: {[key: string]: string} = {
      'Scheduled': '#3B82F6', // Blue
      'Confirmed': '#10B981', // Green
      'In Progress': '#F59E0B', // Amber
      'Completed': '#8B5CF6', // Purple
      'Cancelled': '#EF4444', // Red
      'No Show': '#6B7280'   // Gray
    };
    
    return statusColorMap[status] || '#3B82F6';
  }
}