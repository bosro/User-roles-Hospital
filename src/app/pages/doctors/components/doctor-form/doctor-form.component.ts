import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
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
    ToastModule,
  ],
  templateUrl: './doctor-form.component.html',
})
export class DoctorFormComponent implements OnInit {
  doctorForm!: FormGroup;
  isEditMode = false;
  loading = false;
  doctorId: string = '';

  imagePreview: string | null = null;
  imageBase64: string | null = null;
  
  prefixes = [
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Prof.', value: 'Prof.' },
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Ms.', value: 'Ms.' },
  ];

  specializations = [
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Pediatrics', value: 'Pediatrics' },
    { label: 'Orthopedics', value: 'Orthopedics' },
    { label: 'Dermatology', value: 'Dermatology' },
    { label: 'Ophthalmology', value: 'Ophthalmology' },
    { label: 'Psychiatry', value: 'Psychiatry' },
    { label: 'Gynecology', value: 'Gynecology' },
  ];

  departments = [
    { label: 'Outpatient', value: 'Outpatient' },
    { label: 'Inpatient', value: 'Inpatient' },
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Surgery', value: 'Surgery' },
    { label: 'Intensive Care', value: 'Intensive Care' },
    { label: 'Radiology', value: 'Radiology' },
    { label: 'Laboratory', value: 'Laboratory' },
  ];

  workingDays = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
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
      profilePhoto: [''],
      prefix: ['Dr.', Validators.required],
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
      status: ['active'],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
      }),
      workingDays: [[], Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      about: [''],
      expertise: [[]],
      available: [true],
      role: ['DOCTOR']
    });
  }

  private checkEditMode() {
    this.doctorId = this.route.snapshot.params['id'];
    if (this.doctorId) {
      this.isEditMode = true;
      this.loadDoctor(this.doctorId);
    }
  }

  private loadDoctor(id: string) {
    this.loading = true;
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor:any) => {
        // Handle the image preview if it exists
        if (doctor.profilePhoto) {
          this.imagePreview = doctor.profilePhoto;
          this.imageBase64 = doctor.profilePhoto;
        }
        
        // Create date objects for the time fields
        // const startTime = doctor.startTime ? this.parseTimeString(doctor.startTime) : null;
        // const endTime = doctor.endTime ? this.parseTimeString(doctor.endTime) : null;
        
        // Update languages and expertise from string to array if needed
        const languages = Array.isArray(doctor.languages) ? doctor.languages : [];
        const expertise = typeof doctor.expertise === 'string' 
          ? doctor.expertise.split(', ') 
          : (Array.isArray(doctor.expertise) ? doctor.expertise : []);
        
        // Set values to form
        this.doctorForm.patchValue({
          ...doctor,
          languages,
          expertise,
          // startTime,
          // endTime
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctor:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load doctor details',
        });
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) {
      this.markFormGroupTouched(this.doctorForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill all required fields',
      });
      return;
    }

    this.loading = true;
    
    // Format the data for submission
    const formData = this.doctorForm.value;
    
    // Format time values
    const startTime = formData.startTime ? this.formatTime(formData.startTime) : null;
    const endTime = formData.endTime ? this.formatTime(formData.endTime) : null;
    
    // Format expertise if it's an array
    const expertise = Array.isArray(formData.expertise) 
      ? formData.expertise.join(', ') 
      : formData.expertise;
    
    // Prepare the doctor data
    const doctorData: Partial<Doctor> = {
      ...formData,
      profilePhoto: this.imageBase64,
      startTime,
      endTime,
      expertise
    };
    
    // Perform the API operation (create or update)
    const operation = this.isEditMode
      ? this.doctorService.updateDoctor(this.doctorId, doctorData)
      : this.doctorService.createDoctor(doctorData);

    operation.subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Doctor ${this.isEditMode ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate(['/doctors/list']);
      },
      error: (error) => {
        console.error('Error saving doctor:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} doctor`,
        });
        this.loading = false;
      },
    });
  }

  onPhotoSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.convertToBase64(file);
    }
  }

  onPhotoUpload(event: any) {
    // This is already handled in onPhotoSelect
    // Clear the upload input to allow new uploads
    event.files = [];
  }

  convertToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
      this.imageBase64 = e.target.result;
      this.doctorForm.patchValue({
        profilePhoto: this.imageBase64
      });
    };
    reader.readAsDataURL(file);
  }

  private parseTimeString(timeString: string): Date {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0);
      return date;
    } catch (e) {
      console.error('Error parsing time string:', e);
      return new Date();
    }
  }

  private formatTime(date: Date): string {
    if (!date) return '';
    try {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return '';
    }
  }

  addLanguage(event: any) {
    const value = event.target.value.trim();
    if (value) {
      const languages = this.doctorForm.get('languages')?.value || [];
      if (!languages.includes(value)) {
        this.doctorForm.patchValue({
          languages: [...languages, value],
        });
      }
      event.target.value = '';
    }
    event.preventDefault();
  }

  removeLanguage(language: string) {
    const languages = this.doctorForm.get('languages')?.value || [];
    this.doctorForm.patchValue({
      languages: languages.filter((l: string) => l !== language),
    });
  }

  addExpertise(event: any) {
    const value = event.target.value.trim();
    if (value) {
      const expertise = this.doctorForm.get('expertise')?.value || [];
      if (!expertise.includes(value)) {
        this.doctorForm.patchValue({
          expertise: [...expertise, value],
        });
      }
      event.target.value = '';
    }
    event.preventDefault();
  }

  removeExpertise(item: string) {
    const expertise = this.doctorForm.get('expertise')?.value || [];
    this.doctorForm.patchValue({
      expertise: expertise.filter((e: string) => e !== item),
    });
  }

  cancel() {
    this.router.navigate(['/doctors/list']);
  }

  // Utility method to mark all form controls as touched for validation display
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}