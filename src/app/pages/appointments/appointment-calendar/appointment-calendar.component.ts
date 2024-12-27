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
import { DatePicker } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from '../services/appointment.service';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
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
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  displayEventDialog = false;
  selectedDepartment: string = '';
  
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
      dayMaxEvents: true
    };
  }

  ngOnInit() {
    this.initializeCalendar();
    this.loadAppointments();
  }

  private initializeCalendar() {
    this.calendarOptions = {
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
      dayMaxEvents: true
    };
  }

  private loadAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.updateCalendarEvents();
        this.updateUpcomingAppointments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load appointments'
        });
      }
    });
  }

  private updateCalendarEvents() {
    const events = this.appointments
      .filter(app => !this.selectedDepartment || app.department === this.selectedDepartment)
      .map(app => ({
        id: app.id,
        title: `${app.patientName} - ${app.doctorName}`,
        start: new Date(`${app.date}T${app.startTime}`),
        end: new Date(`${app.date}T${app.endTime}`),
        backgroundColor: this.getStatusColor(app.status)
      }));
    
    this.calendarOptions.events = events;
  }

  private updateUpcomingAppointments() {
    const now = new Date();
    this.upcomingAppointments = this.appointments
      .filter(app => new Date(app.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  handleEventClick(info: any) {
    const appointment = this.appointments.find(app => app.id === info.event.id);
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
    const classes = {
      'scheduled': 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
      'confirmed': 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
      'in-progress': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
      'completed': 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium',
      'cancelled': 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
      'no-show': 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
    };
    return classes[status] || classes['scheduled'];
  }

  getStatusColor(status: AppointmentStatus): string {
    const colors = {
      'scheduled': '#3B82F6',
      'confirmed': '#10B981',
      'in-progress': '#F59E0B',
      'completed': '#8B5CF6',
      'cancelled': '#EF4444',
      'no-show': '#6B7280'
    };
    return colors[status] || colors['scheduled'];
  }
}