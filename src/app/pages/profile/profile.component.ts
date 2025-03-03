import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
// import { RouterModule } from '@angular/router';
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

interface StatConfig {
  label: string;
  value: keyof ProfileStats;
  color: string;
}

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
    // ChipsModule
  ],
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  @ViewChild('appointmentsTemplate') appointmentsTemplate!: TemplateRef<any>;
  @ViewChild('scheduleTemplate') scheduleTemplate!: TemplateRef<any>;

  personalForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;

  profileImage: string = '';
  showPhotoUpload = false;
  saving = false;
  updatingPassword = false;
  savingPreferences = false;
  twoFactorEnabled = false;

  patientsTemplate: any;
  prescriptionsTemplate: any;
  medicalHistoryTemplate: any;
  departmentsTemplate: any;
  staffTemplate: any;
  reportsTemplate: any;
  assignmentsTemplate: any;
  proceduresTemplate: any;

  appointments: any[] = [];
  viewOptions = [
    { label: 'Month', value: 'dayGridMonth' },
    { label: 'Week', value: 'timeGridWeek' },
    { label: 'Day', value: 'timeGridDay' },
  ];
  currentView = 'dayGridMonth';
  selectedDate = new Date();
  calendarOptions: any = {
    // FullCalendar options
  };
  scheduleEvents: any[] = [];

  searchTerm = '';
  filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Recent', value: 'recent' },
    { label: 'Critical', value: 'critical' },
  ];
  selectedFilter = 'all';
  filteredPatients: any[] = [];

  prescriptions: any[] = [];
  medicalHistory: any[] = [];
  departments: any[] = [];
  staffMembers: any[] = [];
  staffFilters: any[] = [];

  userData: any = {
    name: 'Dr. John Doe',
    role: 'Senior Cardiologist',
    stats: {
      totalPatients: 1243,
      appointmentsThisMonth: 45,
      yearsOfService: 8,
    },
  };

  preferences = {
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    darkMode: false,
    compactView: false,
  };

  loginHistory = [
    {
      location: 'New York, USA',
      device: 'Chrome on Windows',
      timestamp: new Date(),
      status: 'success',
    },
    {
      location: 'Unknown Location',
      device: 'Safari on iPhone',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'failed',
    },
    // Add more login history...
  ];

  userProfile!: UserProfile;

  statsConfig: Record<string, StatConfig[]> = {
    doctor: [
      { label: 'Total Patients', value: 'totalPatients', color: 'blue' },
      { label: 'Appointments', value: 'appointmentsThisMonth', color: 'green' },
      { label: 'Years of Service', value: 'yearsOfService', color: 'purple' },
    ],
    nurse: [
      { label: 'Assigned Patients', value: 'assignedPatients', color: 'blue' },
      {
        label: 'Completed Procedures',
        value: 'completedProcedures',
        color: 'green',
      },
      { label: 'Years of Service', value: 'yearsOfService', color: 'purple' },
    ],
    patient: [
      {
        label: 'Total Appointments',
        value: 'totalAppointments',
        color: 'blue',
      },
      { label: 'Admitted Days', value: 'admittedDays', color: 'orange' },
      { label: 'Last Visit', value: 'lastVisit', color: 'green' },
    ],
    admin: [
      { label: 'Departments', value: 'totalDepartments', color: 'blue' },
      { label: 'Staff Members', value: 'totalStaff', color: 'green' },
      { label: 'Active Patients', value: 'activePatients', color: 'purple' },
    ],
  };

  shifts = [
    { label: 'Morning', value: 'morning' },
    { label: 'Afternoon', value: 'afternoon' },
    { label: 'Night', value: 'night' },
  ];

  bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
  ];

  accessLevels = [
    { label: 'Full Access', value: 'full' },
    { label: 'Limited Access', value: 'limited' },
    { label: 'Read Only', value: 'readonly' },
  ];

  availablePermissions = [
    { label: 'View Users', value: 'view_users' },
    { label: 'Manage Users', value: 'manage_users' },
    { label: 'View Reports', value: 'view_reports' },
    { label: 'Manage Settings', value: 'manage_settings' },
  ];

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

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadUserData(id);
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
      bio: [''],
      licenseNumber: [''],
      consultationFee: [''],
      address: this.addressForm,
      workingDays: [[]],
      startTime: [''],
      endTime: [''],
      languages: [[]]
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

  private loadUserData(id:any) {
    const user =localStorage.getItem('user')
    console.log(user)
    this.profileService.getUserProfile(id).subscribe({
      next: (data) => {
        // Map the API response to our UserProfile model
        this.userProfile = {
          id: data.id || '',
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
          bio: data.about || '',
          licenseNumber: this.userProfile.licenseNumber,
          consultationFee: this.userProfile.consultationFee,
          // workingDays: this.userProfile.availability.workingDays,
          // startTime: this.userProfile.availability.startTime,
          // endTime: this.userProfile.availability.endTime,
          languages: data.languages || []
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
        // Update profile image with the URL returned from the server
        if (response && response.profilePhoto) {
          this.profileImage = response.profilePhoto;
          this.userProfile.profileImage = response.profilePhoto;
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
      about: formData.bio,
      licenseNumber: formData.licenseNumber,
      consultationFee: formData.consultationFee,
      address: formData.address,
      workingDays: formData.workingDays,
      startTime: formData.startTime,
      endTime: formData.endTime,
      languages: formData.languages
    };

    this.profileService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Personal information updated successfully',
        });
        
        // Update local user profile data with the response
        if (response) {
          this.userProfile.firstName = response.firstName || this.userProfile.firstName;
          this.userProfile.lastName = response.lastName || this.userProfile.lastName;
          this.userProfile.email = response.email || this.userProfile.email;
          this.userProfile.phone = response.phone || this.userProfile.phone;
          // this.userProfile.specialization = response.specialization || this.userProfile.specialization;
          // this.userProfile.department = response.department || this.userProfile.department;
          // this.userProfile.licenseNumber = response.licenseNumber || this.userProfile.licenseNumber;
          // this.userProfile.consultationFee = response.consultationFee || this.userProfile.consultationFee;
          
          // if (response.availability) {
          //   this.userProfile.availability = {
          //     workingDays: response.workingDays || this.userProfile.availability.workingDays,
          //     startTime: response.startTime || this.userProfile.availability.startTime,
          //     endTime: response.endTime || this.userProfile.availability.endTime,
          //   };
          // }
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

  toggleTwoFactor() {
    if (this.twoFactorEnabled) {
      this.setupTwoFactor();
    } else {
      this.disableTwoFactor();
    }
  }

  private setupTwoFactor() {
    this.profileService.setupTwoFactor().subscribe({
      next: (response) => {
        // Typically, the API would return a QR code or setup key
        this.messageService.add({
          severity: 'info',
          summary: 'Setup Required',
          detail: 'Please complete two-factor authentication setup',
        });
        // Here you would show the QR code to the user
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to setup two-factor authentication',
        });
        console.error('Error setting up 2FA:', error);
        this.twoFactorEnabled = false; // Reset the toggle
      }
    });
  }

  private disableTwoFactor() {
    this.profileService.disableTwoFactor().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Disabled',
          detail: 'Two-factor authentication has been disabled',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to disable two-factor authentication',
        });
        console.error('Error disabling 2FA:', error);
        this.twoFactorEnabled = true; // Reset the toggle
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

  getRoleSpecificFields(): { [key: string]: any } {
    const fields = {
      doctor: {
        prefix: ['', Validators.required],
        specialization: ['', Validators.required],
        department: ['', Validators.required],
        licenseNumber: ['', Validators.required],
        consultationFee: [0, Validators.required],
      },
      nurse: {
        department: ['', Validators.required],
        shift: ['', Validators.required],
        licenseNumber: ['', Validators.required],
        specializations: [[]],
      },
      patient: {
        dateOfBirth: [null, Validators.required],
        bloodGroup: ['', Validators.required],
        address: this.fb.group({
          street: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          zipCode: ['', Validators.required],
        }),
        emergencyContact: this.fb.group({
          name: ['', Validators.required],
          relationship: ['', Validators.required],
          phone: ['', Validators.required],
        }),
      },
      admin: {
        department: ['', Validators.required],
        accessLevel: ['', Validators.required],
        permissions: [[]],
      },
    };

    return fields[this.userProfile.role] || {};
  }

  initializeForm() {
    const baseFields = {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      bio: [''],
    };

    const roleSpecificFields = this.getRoleSpecificFields();

    this.personalForm = this.fb.group({
      ...baseFields,
      ...roleSpecificFields,
    });
  }

  getRoleTitle(role?: string): string {
    const titles: {[key: string]: string} = {
      doctor: 'Medical Doctor',
      nurse: 'Registered Nurse',
      patient: 'Patient',
      admin: 'System Administrator',
    };
    return role ? titles[role.toLowerCase()] || '' : '';
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
      schedule: this.scheduleTemplate,
      patients: this.patientsTemplate,
      prescriptions: this.prescriptionsTemplate,
      'medical-history': this.medicalHistoryTemplate,
      departments: this.departmentsTemplate,
      staff: this.staffTemplate,
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

  getStaffStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary'
    > = {
      active: 'success',
      inactive: 'danger',
      onLeave: 'warn',
    };
    return severities[status] || 'info';
  }

  // Action methods
  setAvailability() {
    // Implement availability setting logic
    const availabilityData = {
      workingDays: this.personalForm.value.workingDays,
      startTime: this.personalForm.value.startTime,
      endTime: this.personalForm.value.endTime
    };
    
    this.profileService.updateProfile(availabilityData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Availability updated successfully',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update availability',
        });
        console.error('Error updating availability:', error);
      }
    });
  }

  viewAppointment(appointment: any) {
    // Implement view logic
    console.log('Viewing appointment:', appointment);
  }

  editAppointment(appointment: any) {
    // Implement edit logic
    console.log('Editing appointment:', appointment);
  }

  canModifyAppointment(appointment: any): boolean {
    // Implement permission check
    return true;
  }

  viewPatientRecords(patient: any) {
    // Implement record viewing logic
    console.log('Viewing patient records:', patient);
  }

  scheduleAppointment(patient: any) {
    // Implement scheduling logic
    console.log('Scheduling appointment for patient:', patient);
  }

  getDaySchedule() {
    // Filter events for selected date
    return this.scheduleEvents.filter((event) => {
      const eventDate = new Date(event.time);
      return eventDate.toDateString() === this.selectedDate.toDateString();
    });
  }

  onDateSelect(date: Date) {
    this.selectedDate = date;
    // Fetch schedule for selected date
  }

  ngOnDestroy() {
    // Clean up resources associated with TabView
    this.scheduleEvents = []; // Clear any events or data bound to TabView
  }
}
