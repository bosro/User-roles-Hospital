import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { ProfileStats, UserProfile } from './models/profile.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
// import { ChipsModule } from 'primeng/chips';
import { ProfileService } from './services/profile.service';

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
    FormsModule,
    MultiSelectModule,
    TableModule,
    AccordionModule,
    SelectButtonModule,
    FullCalendarModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    // ChipsModule  // Uncomment this
  ],
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  @ViewChild('appointmentsTemplate') appointmentsTemplate!: TemplateRef<any>;
  @ViewChild('prescriptionsTemplate') prescriptionsTemplate!: TemplateRef<any>;

  personalForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;
  private readonly USER_KEY = 'user';
  profileImage: string = '';
  showPhotoUpload = false;
  saving = false;
  updatingPassword = false;
  savingPreferences = false;
  twoFactorEnabled = false;

  appointments: any[] = [];
  prescriptions: any[] = [];
  
  preferences = {
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    darkMode: false,
    compactView: false,
  };

  userProfile!: UserProfile;

  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.userProfile = {
      id: '',
      role: 'doctor',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      profileImage: '',
      prefix: 'Dr.',
      specialization: '',
      department: '',
      licenseNumber: '',
      consultationFee: 0,
      availability: {
        workingDays: [],
        startTime: '',
        endTime: '',
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        darkMode: false,
        compactView: false,
      },
      stats: {
        totalPatients: 0,
        appointmentsThisMonth: 0,
        yearsOfService: 0,
        totalAppointments: 0,
        completedProcedures: 0,
        assignedPatients: 0,
        admittedPatients: 0,
        dischargedPatients: 0,
        admittedDays: 0,
        lastVisit: new Date(),
        totalDepartments: 0,
        totalStaff: 0,
        activePatients: 0,
      },
    };
    this.initializeForms();
  }

  ngOnInit() {
    const userData = localStorage.getItem(this.USER_KEY); 
    const user = userData ? JSON.parse(userData) : null; 
    if (user && user._id) { 
        this.loadUserData(user._id); 
    }
  }

  private initializeForms() {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
    });

    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      specialization: [''],
      department: [''],
      about: [''],
      licenseNumber: [''],
      qualification: [''],
      experience: [0],
      consultationFee: [0],
      address: this.addressForm,
      workingDays: [[]],
      startTime: [''],
      endTime: [''],
      languages: [[]],
      expertise: ['']
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword?.value === confirmPassword?.value
      ? null
      : { mismatch: true };
  }

  private loadUserData(id: string) {
    this.profileService.getUserProfile(id).subscribe({
      next: (response) => {
        // Check if response has a data property (API response structure)
        const data = response.data || response;
        
        // Map the API response to our UserProfile model
        this.userProfile = {
          id: data._id || '',
          role: data.role?.toLowerCase() || 'doctor',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profilePhoto || '',
          prefix: data.prefix || 'Dr.',
          specialization: data.specialization || '',
          department: data.department || '',
          licenseNumber: data.licenseNumber || '',
          consultationFee: data.consultationFee || 0,
          availability: {
            workingDays: data.workingDays || [],
            startTime: data.startTime || '',
            endTime: data.endTime || '',
          },
          preferences: {
            emailNotifications: true,
            smsNotifications: true,
            appointmentReminders: true,
            darkMode: false,
            compactView: false,
          },
          stats: {
            totalPatients: 0,
            appointmentsThisMonth: 0,
            yearsOfService: data.experience || 0,
            totalAppointments: 0,
            completedProcedures: 0,
            assignedPatients: 0,
            admittedPatients: 0,
            dischargedPatients: 0,
            admittedDays: 0,
            lastVisit: new Date(),
            totalDepartments: 0,
            totalStaff: 0,
            activePatients: 0,
          },
        };

        // Update the form with the user data
        this.personalForm.patchValue({
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          email: this.userProfile.email,
          phone: this.userProfile.phone,
          specialization: this.userProfile.specialization,
          department: this.userProfile.department,
          about: data.about || '',
          licenseNumber: this.userProfile.licenseNumber,
          consultationFee: this.userProfile.consultationFee,
          qualification: data.qualification || '',
          experience: data.experience || 0,
          // workingDays: this.userProfile.availability.workingDays,
          // startTime: this.userProfile.availability.startTime,
          // endTime: this.userProfile.availability.endTime,
          languages: data.languages || [],
          expertise: data.expertise || ''
        });

        if (data.address) {
          this.addressForm.patchValue({
            street: data.address.street || '',
            city: data.address.city || '',
            state: data.address.state || '',
            zipCode: data.address.zipCode || '',
          });
        }

        // Set profile image if available
        if (this.userProfile.profileImage) {
          this.profileImage = this.userProfile.profileImage;
        }
        
        console.log('Profile loaded successfully:', this.userProfile);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load profile data',
        });
        console.error('Error loading profile data:', error);
      }
    });
  }

  showPhotoDialog() {
    this.showPhotoUpload = true;
  }

  onPhotoUpload(event: { files: File[] }) {
    const file = event.files[0];
    if (!file) return;
    
    this.profileService.updatePhoto(file).subscribe({
      next: (response) => {
        // Handle the nested response structure if needed
        const data = response.data || response;
        
        // Update profile image with the URL returned from the server
        if (data && data.profilePhoto) {
          this.profileImage = data.profilePhoto;
          this.userProfile.profileImage = data.profilePhoto;
        } else {
          // If no URL is returned, create a temporary URL for preview
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result) {
              this.profileImage = e.target.result as string;
              this.userProfile.profileImage = this.profileImage;
            }
          };
          reader.readAsDataURL(file);
        }
        
        this.showPhotoUpload = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile photo updated successfully',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update profile photo',
        });
        console.error('Error updating profile photo:', error);
      }
    });
  }

  updatePersonalInfo() {
    if (this.personalForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly',
      });
      return;
    }

    this.saving = true;
    
    // Prepare the data to be sent to the API
    const formData = this.personalForm.value;
    const profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialization,
      department: formData.department,
      about: formData.about,
      licenseNumber: formData.licenseNumber,
      qualification: formData.qualification,
      experience: formData.experience,
      consultationFee: formData.consultationFee,
      address: formData.address,
      workingDays: formData.workingDays,
      startTime: formData.startTime,
      endTime: formData.endTime,
      languages: formData.languages,
      expertise: formData.expertise
    };

    this.profileService.updateProfile(profileData).subscribe({
      next: (response) => {
        // Handle the nested response structure if needed
        const data = response.data || response;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Personal information updated successfully',
        });
        
        // Update local user profile data with the response
        if (data) {
          this.userProfile.firstName = data.firstName || this.userProfile.firstName;
          this.userProfile.lastName = data.lastName || this.userProfile.lastName;
          this.userProfile.email = data.email || this.userProfile.email;
          this.userProfile.phone = data.phone || this.userProfile.phone;
          // Update other fields as needed
        }
        
        this.saving = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update personal information',
        });
        console.error('Error updating profile:', error);
        this.saving = false;
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) {
      // Check for specific validation errors
      if (this.passwordForm.hasError('mismatch')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Passwords do not match',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill all required password fields',
        });
      }
      return;
    }

    this.updatingPassword = true;
    
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    this.profileService.updatePassword(passwordData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password updated successfully',
        });
        this.passwordForm.reset();
        this.updatingPassword = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to update password';
        
        // Check for specific error responses from the API
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Current password is incorrect';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
        });
        console.error('Error updating password:', error);
        this.updatingPassword = false;
      }
    });
  }

  savePreferences() {
    this.savingPreferences = true;
    
    this.profileService.updatePreferences(this.preferences).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Preferences saved successfully',
        });
        this.userProfile.preferences = { ...this.preferences };
        this.savingPreferences = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save preferences',
        });
        console.error('Error saving preferences:', error);
        this.savingPreferences = false;
      }
    });
  }

  showFieldError(fieldName: string): boolean {
    const field = this.personalForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  formatTabHeader(tab: string): string {
    return tab
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getTabContent(tab: string): TemplateRef<any> | null {
    const templates: Record<string, TemplateRef<any>> = {
      appointments: this.appointmentsTemplate,
      prescriptions: this.prescriptionsTemplate,
    };
    return templates[tab] || null;
  }

  getRoleSpecificTabs() {
    const tabs: {[key: string]: string[]} = {
      doctor: ['appointments', 'patients', 'schedule'],
      nurse: ['assignments', 'schedule', 'procedures'],
      patient: ['appointments', 'prescriptions', 'medical-history'],
      admin: ['departments', 'staff', 'reports'],
    };

    return tabs[this.userProfile.role.toLowerCase()] || [];
  }

  // Helper methods
  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary'
    > = {
      scheduled: 'info',
      completed: 'success',
      cancelled: 'danger',
      pending: 'warn',
    };
    return severities[status] || 'info';
  }

  getPrescriptionStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary'
    > = {
      active: 'success',
      completed: 'info',
      discontinued: 'danger',
    };
    return severities[status] || 'info';
  }
}