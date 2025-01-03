import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
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
import { ProfileStats, UserProfile } from './models/profile.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

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
  ],
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  @ViewChild('appointmentsTemplate') appointmentsTemplate!: TemplateRef<any>;
  @ViewChild('scheduleTemplate') scheduleTemplate!: TemplateRef<any>;

  personalForm!: FormGroup;
  passwordForm!: FormGroup;

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

  statsConfig: Record<UserProfile['role'], StatConfig[]> = {
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

  constructor(private fb: FormBuilder, private messageService: MessageService) {
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
      // Add the required preferences property
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
      bio: [''],
      licenseNumber: [''],
      consultationFee: [''],
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

  private loadUserData() {
    // Simulating API call to load user data
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@hospital.com',
      phone: '+1 (555) 123-4567',
      specialization: 'Cardiology',
      department: 'Cardiology Department',
      bio: 'Experienced cardiologist with over 8 years of practice...',
      // Add preferences when loading user data
      preferences: {
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        darkMode: false,
        compactView: false,
      },
    };

    this.userProfile = {
      ...this.userProfile,
      ...userData,
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
          detail: 'Profile photo updated successfully',
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
        detail: 'Personal information updated successfully',
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
        detail: 'Password updated successfully',
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
      detail: 'Please complete two-factor authentication setup',
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
      detail: 'Two-factor authentication has been disabled',
    });
  }

  savePreferences() {
    this.savingPreferences = true;
    // Simulating API call to save preferences
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Preferences saved successfully',
      });
      this.savingPreferences = false;
    }, 1000);
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
    const titles = {
      doctor: 'Medical Doctor',
      nurse: 'Registered Nurse',
      patient: 'Patient',
      admin: 'System Administrator',
    };
    return role ? titles[role as keyof typeof titles] : '';
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
    const tabs = {
      doctor: ['appointments', 'patients', 'schedule'],
      nurse: ['assignments', 'schedule', 'procedures'],
      patient: ['appointments', 'prescriptions', 'medical-history'],
      admin: ['departments', 'staff', 'reports'],
    };

    return tabs[this.userProfile.role] || [];
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
  }

  viewAppointment(appointment: any) {
    // Implement view logic
  }

  editAppointment(appointment: any) {
    // Implement edit logic
  }

  canModifyAppointment(appointment: any): boolean {
    // Implement permission check
    return true;
  }

  viewPatientRecords(patient: any) {
    // Implement record viewing logic
  }

  scheduleAppointment(patient: any) {
    // Implement scheduling logic
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
