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
import { PatientService } from '../../patients/services/patient.service';
import { DoctorService } from '../../doctors/services/doctor.service';
import { filter, finalize } from 'rxjs';

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
  templateUrl: './appointment-form.component.html',
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
    { label: 'Regular', value: 'Regular' },
    { label: 'Follow-up', value: 'Follow-up' },
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Consultation', value: 'Consultation' },
    { label: 'Procedure', value: 'Procedure' },
  ];

  appointmentStatuses = [
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'No Show', value: 'No Show' },
  ];
  filters: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
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
      type: ['Consultation', Validators.required],
      status: ['Scheduled', Validators.required],
      notes: [''],
    });
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

  private loadInitialData() {
    this.loading = true;
    const params= filter
    
    // Load patients
    this.patientService.getPatients(params).subscribe({
      next: (patients) => {
        this.patients = patients.map(patient => ({
          label: `${patient.firstName} ${patient.lastName}`,
          value: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          id: patient._id
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patients: ' + (error.message || 'Unknown error')
        });
      },
      complete: () => this.loading = false
    });

    // Load doctors
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors.map(doctor => ({
          label: `${doctor.firstName} ${doctor.lastName}`,
          value: doctor.id,
          name: `${doctor.firstName} ${doctor.lastName}`,
          id: doctor.id,
          department: doctor.department
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load doctors: ' + (error.message || 'Unknown error')
        });
      }
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadAppointment(id);
    }
  }

  private loadAppointment(id: string) {
    this.loading = true;
    this.appointmentService.getAppointmentById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (appointment) => {
          // Determine patient and doctor IDs
          const patientId = typeof appointment.patient === 'object' ? 
            appointment.patient._id : appointment.patient;
          
          const doctorId = typeof appointment.doctor === 'object' ? 
            appointment.doctor._id : appointment.doctor;
          
          // Initialize the form with appointment data
          this.appointmentForm.patchValue({
            patientId: patientId,
            doctorId: doctorId,
            date: new Date(appointment.date),
            type: appointment.type,
            status: appointment.status,
            notes: appointment.notes || '',
          });
          
          // Once doctor and date are set, load time slots
          this.loadAvailableTimeSlots(() => {
            // After time slots are loaded, find the matching one from the appointment
            if (appointment.timeSlot) {
              const [startTime, endTime] = appointment.timeSlot.split('-').map(t => t.trim());
              
              // Find the matching slot in available slots
              setTimeout(() => {
                const matchingSlot = this.availableTimeSlots.find(slot => 
                  slot.label === `${startTime} - ${endTime}`
                );
                
                if (matchingSlot) {
                  this.appointmentForm.patchValue({ timeSlot: matchingSlot.value });
                } else {
                  // If not found in available slots, create a custom slot
                  const customSlot = {
                    label: appointment.timeSlot,
                    value: { startTime, endTime }
                  };
                  this.availableTimeSlots.push(customSlot);
                  this.appointmentForm.patchValue({ timeSlot: customSlot.value });
                }
              }, 100);
            }
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load appointment: ' + (error.message || 'Unknown error')
          });
        }
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

  private loadAvailableTimeSlots(callback?: () => void) {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const date = this.appointmentForm.get('date')?.value;

    if (!doctorId || !date) {
      if (callback) callback();
      return;
    }

    this.loading = true;
    this.appointmentService.getDoctorSchedule(doctorId, date)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (schedule) => {
          this.availableTimeSlots = schedule.availableSlots.map((slot) => ({
            label: `${slot.startTime} - ${slot.endTime}`,
            value: {
              startTime: slot.startTime,
              endTime: slot.endTime
            },
          }));
          
          // If no available slots from API, generate sample slots for demo
          if (this.availableTimeSlots.length === 0) {
            this.generateSampleTimeSlots();
          }
          
          if (callback) callback();
        },
        error: (error) => {
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: 'Failed to load available time slots: ' + (error.message || 'Unknown error')
          // });
          
          // Generate sample slots if API fails
          this.generateSampleTimeSlots();
          
          if (callback) callback();
        }
      });
  }
  
  // Generate sample time slots for demo purposes
  private generateSampleTimeSlots() {
    const slots = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' }
    ];
    
    this.availableTimeSlots = slots.map(slot => ({
      label: `${slot.startTime} - ${slot.endTime}`,
      value: slot
    }));
  }

  onSubmit() {
    if (this.appointmentForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.appointmentForm.controls).forEach(key => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    this.loading = true;
    const formValue = this.appointmentForm.value;
    const timeSlot = formValue.timeSlot;
    
    const appointment: Partial<Appointment> = {
      patientId: formValue.patientId.value,
      doctorId: formValue.doctorId.doctor.id,
      date: formValue.date,
      timeSlot: timeSlot.startTime,
      type: formValue.type,
      status: formValue.status,
      notes: formValue.notes || '',
    };

    console.log(appointment)

    const operation = this.isEditMode
      ? this.appointmentService.updateAppointment({
          ...appointment,
          id: this.route.snapshot.params['id'],
        } as Appointment)
      : this.appointmentService.createAppointment(appointment);

    operation
      .pipe(finalize(() => this.loading = false))
      .subscribe({
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
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${
              this.isEditMode ? 'update' : 'create'
            } appointment: ` + (error.message || 'Unknown error')
          });
        }
      });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  navigateToNewPatient() {
    // Save current form state if needed
    this.router.navigate(['/patients/add'], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}