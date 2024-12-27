import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DatePicker } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../doctors.model';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    Avatar,
    FormsModule,
    FullCalendarModule
  ],
  templateUrl: 'doctor-schedule.component.html'
})
export class DoctorScheduleComponent implements OnInit {
  doctors: any[] = [];
  selectedDoctorId: string | null = null;
  selectedDoctor: Doctor | null = null;
  calendarOptions: any;
  
  // Dialogs
  showBlockTime = false;
  showLeave = false;
  blockTimeForm!: FormGroup;
  leaveForm!: FormGroup;
  
  // Stats
  todayStats = {
    totalAppointments: 0,
    completed: 0,
    pending: 0
  };

  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private messageService: MessageService
  ) {
    this.initializeForms();
    this.initializeCalendar();
  }

  ngOnInit() {
    this.loadDoctors();
    this.checkQueryParams();
  }

  private initializeForms() {
    this.blockTimeForm = this.fb.group({
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      reason: ['', Validators.required]
    });

    this.leaveForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['', Validators.required]
    });
  }

  private initializeCalendar() {
    this.calendarOptions = {
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',
      slotDuration: '00:15:00',
      allDaySlot: false,
      editable: false,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: [],
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00',
      }
    };
  }

  private loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors.map(d => ({
          value: d.id,
          label: `${d.prefix} ${d.firstName} ${d.lastName}`,
          ...d
        }));
      }
    });
  }

  private checkQueryParams() {
    // Check for doctorId in query params
  }

  onDoctorChange() {
    if (this.selectedDoctorId) {
      this.loadDoctorSchedule(this.selectedDoctorId);
    }
  }

  private loadDoctorSchedule(doctorId: string) {
    // Load doctor's schedule and update calendar
  }

  handleDateSelect(selectInfo: any) {
    // Handle date selection
  }

  handleEventClick(clickInfo: any) {
    // Handle event click
  }

  showBlockTimeDialog() {
    this.showBlockTime = true;
  }

  hideBlockTimeDialog() {
    this.showBlockTime = false;
    this.blockTimeForm.reset();
  }

  showLeaveDialog() {
    this.showLeave = true;
  }

  hideLeaveDialog() {
    this.showLeave = false;
    this.leaveForm.reset();
  }

  blockTime() {
    if (this.blockTimeForm.invalid) return;
    // Implement block time logic
  }

  setLeave() {
    if (this.leaveForm.invalid) return;
    // Implement set leave logic
  }

  formatWorkingDays(days: string[]): string {
    return days.map(day => 
      day.charAt(0).toUpperCase() + day.slice(1)
    ).join(', ');
  }
}