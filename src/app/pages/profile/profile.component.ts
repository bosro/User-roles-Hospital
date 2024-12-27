import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TabViewModule,
    AvatarModule,
    FileUploadModule,
    DialogModule,
    PasswordModule,
    InputSwitchModule,
    ToastModule,
    TimelineModule,
    TagModule,
    FormsModule
  ],
  templateUrl: 'profile.component.html'
})
export class ProfileComponent implements OnInit {
  personalForm!: FormGroup;
  passwordForm!: FormGroup;
  
  profileImage: string  = '';
  showPhotoUpload = false;
  saving = false;
  updatingPassword = false;
  savingPreferences = false;
  twoFactorEnabled = false;

  
  userData: any = {
    name: 'Dr. John Doe',
    role: 'Senior Cardiologist',
    stats: {
      totalPatients: 1243,
      appointmentsThisMonth: 45,
      yearsOfService: 8
    }
  };

  preferences = {
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    darkMode: false,
    compactView: false
  };

  loginHistory = [
    {
      location: 'New York, USA',
      device: 'Chrome on Windows',
      timestamp: new Date(),
      status: 'success'
    },
    {
      location: 'Unknown Location',
      device: 'Safari on iPhone',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'failed'
    }
    // Add more login history...
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserData();
  }

  private initializeForms() {
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      specialization: [''],
      department: [''],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword?.value === confirmPassword?.value ? null : { mismatch: true };
  }

  private loadUserData() {
    // Simulating API call to load user data
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@hospital.com',
      phone: '+1 (555) 123-4567',
      specialization: 'Cardiology',
      department: 'Cardiology Department',
      bio: 'Experienced cardiologist with over 8 years of practice...'
    };

    this.personalForm.patchValue(userData);
  }

  showPhotoDialog() {
    this.showPhotoUpload = true;
  }

  onPhotoUpload(event: { files: File[] }) {
    const file = event.files[0];
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        // Type assertion since we know it will be a string
        this.profileImage = e.target.result as string;
        this.showPhotoUpload = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile photo updated successfully'
        });
      }
    };

    reader.readAsDataURL(file);
  }

  updatePersonalInfo() {
    if (this.personalForm.invalid) return;

    this.saving = true;
    // Simulating API call to update user data
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Personal information updated successfully'
      });
      this.saving = false;
    }, 1000);
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    this.updatingPassword = true;
    // Simulating API call to update password
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Password updated successfully'
      });
      this.passwordForm.reset();
      this.updatingPassword = false;
    }, 1000);
  }

  toggleTwoFactor() {
    if (this.twoFactorEnabled) {
      this.setupTwoFactor();
    } else {
      this.disableTwoFactor();
    }
  }

  private setupTwoFactor() {
    // Implement 2FA setup logic
    this.messageService.add({
      severity: 'info',
      summary: 'Setup Required',
      detail: 'Please complete two-factor authentication setup'
    });
    // Here you would typically:
    // 1. Generate QR code
    // 2. Show setup instructions
    // 3. Verify setup with a test code
  }

  private disableTwoFactor() {
    // Implement 2FA disable logic
    this.messageService.add({
      severity: 'success',
      summary: 'Disabled',
      detail: 'Two-factor authentication has been disabled'
    });
  }

  savePreferences() {
    this.savingPreferences = true;
    // Simulating API call to save preferences
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Preferences saved successfully'
      });
      this.savingPreferences = false;
    }, 1000);
  }

}