// src/app/pages/doctors/components/doctor-form/doctor-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { Doctor } from '../../doctors.model';
import { DoctorService } from '../../services/doctor.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    MultiSelectModule,
    CalendarModule,
    TextareaModule,
    ChipModule,  
    FileUploadModule,
    ToastModule
  ],
  templateUrl: 'doctor-form.component.html'
})
export class DoctorFormComponent implements OnInit {
  doctorForm!: FormGroup;
  isEditMode = false;
  loading = false;

  prefixes = [
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Prof.', value: 'Prof.' },
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Ms.', value: 'Ms.' }
  ];

  specializations = [
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Pediatrics', value: 'Pediatrics' },
    { label: 'Orthopedics', value: 'Orthopedics' },
    { label: 'Dermatology', value: 'Dermatology' }
  ];

  departments = [
    { label: 'Outpatient', value: 'Outpatient' },
    { label: 'Inpatient', value: 'Inpatient' },
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Surgery', value: 'Surgery' }
  ];

  workingDays = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday', value: 'sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.checkEditMode();
  }

  private initializeForm() {
    this.doctorForm = this.fb.group({
      prefix: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      specialization: ['', Validators.required],
      department: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      qualification: ['', Validators.required],
      languages: [[]],
      consultationFee: [0, [Validators.required, Validators.min(0)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      workingDays: [[], Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      about: [''],
      expertise: [[]]
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadDoctor(id);
    }
  }

  private loadDoctor(id: string) {
    this.loading = true;
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor) => {
        this.doctorForm.patchValue(doctor);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load doctor details'
        });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) return;

    this.loading = true;
    const doctorData = {
      ...this.doctorForm.value,
      workingHours: {
        start: this.formatTime(this.doctorForm.value.startTime),
        end: this.formatTime(this.doctorForm.value.endTime)
      }
    };

    const operation = this.isEditMode
      ? this.doctorService.updateDoctor(this.route.snapshot.params['id'], doctorData)
      : this.doctorService.createDoctor(doctorData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Doctor ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} doctor`
        });
        this.loading = false;
      }
    });
  }

  onPhotoUpload(event: any) {
    // Handle photo upload
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  addLanguage(event: any) {
    const value = event.target.value.trim();
    if (value) {
      const languages = this.doctorForm.get('languages')?.value || [];
      if (!languages.includes(value)) {
        this.doctorForm.patchValue({
          languages: [...languages, value]
        });
      }
      event.target.value = '';
    }
    event.preventDefault();
  }
  
  removeLanguage(language: string) {
    const languages = this.doctorForm.get('languages')?.value || [];
    this.doctorForm.patchValue({
      languages: languages.filter((l: string) => l !== language)
    });
  }
  
  addExpertise(event: any) {
    const value = event.target.value.trim();
    if (value) {
      const expertise = this.doctorForm.get('expertise')?.value || [];
      if (!expertise.includes(value)) {
        this.doctorForm.patchValue({
          expertise: [...expertise, value]
        });
      }
      event.target.value = '';
    }
    event.preventDefault();
  }
  
  removeExpertise(item: string) {
    const expertise = this.doctorForm.get('expertise')?.value || [];
    this.doctorForm.patchValue({
      expertise: expertise.filter((e: string) => e !== item)
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}