import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '../models/appointment.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: 'appointment-form.component.html',
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  isEditMode = false;
  loading = false;
  minDate = new Date();

  patients: any[] = [];
  doctors: any[] = [];
  availableTimeSlots: any[] = [];

  appointmentTypes = [
    { label: 'Regular', value: 'regular' },
    { label: 'Follow-up', value: 'follow-up' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Consultation', value: 'consultation' },
    { label: 'Procedure', value: 'procedure' },
  ];

  appointmentStatuses = [
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'No Show', value: 'no-show' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();
  }

  private initializeForm() {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      type: ['regular', Validators.required],
      status: ['scheduled', Validators.required],
      notes: [''],
    });
  }

  private loadInitialData() {
    // Load patients and doctors data
    // This would typically come from your services
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadAppointment(id);
    }
  }

  private loadAppointment(id: string) {
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (appointment) => {
        this.appointmentForm.patchValue({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          date: new Date(appointment.date),
          timeSlot: {
            startTime: appointment.startTime,
            endTime: appointment.endTime,
          },
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load appointment',
        });
      },
    });
  }

  onDoctorChange() {
    this.appointmentForm.get('timeSlot')?.setValue(null);
    if (this.appointmentForm.get('date')?.value) {
      this.loadAvailableTimeSlots();
    }
  }

  onDateSelect() {
    this.appointmentForm.get('timeSlot')?.setValue(null);
    if (this.appointmentForm.get('doctorId')?.value) {
      this.loadAvailableTimeSlots();
    }
  }

  private loadAvailableTimeSlots() {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const date = this.appointmentForm.get('date')?.value;

    if (doctorId && date) {
      this.appointmentService.getDoctorSchedule(doctorId, date).subscribe({
        next: (schedule) => {
          this.availableTimeSlots = schedule.availableSlots.map((slot:any) => ({
            label: `${slot.startTime} - ${slot.endTime}`,
            value: slot,
          }));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available time slots',
          });
        },
      });
    }
  }

  onSubmit() {
    if (this.appointmentForm.invalid) return;

    this.loading = true;
    const formValue = this.appointmentForm.value;
    const appointment: Partial<Appointment> = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId,
      date: formValue.date,
      startTime: formValue.timeSlot.startTime,
      endTime: formValue.timeSlot.endTime,
      type: formValue.type,
      status: formValue.status,
      notes: formValue.notes,
    };

    const operation = this.isEditMode
      ? this.appointmentService.updateAppointment({
          ...appointment,
          id: this.route.snapshot.params['id'],
        } as Appointment)
      : this.appointmentService.createAppointment(
          appointment as Omit<Appointment, 'id'>
        );

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Appointment ${
            this.isEditMode ? 'updated' : 'created'
          } successfully`,
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      // Continuing AppointmentFormComponent...
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${
            this.isEditMode ? 'update' : 'create'
          } appointment`,
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  navigateToNewPatient() {
    this.router.navigate(['/patients/add'], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}

