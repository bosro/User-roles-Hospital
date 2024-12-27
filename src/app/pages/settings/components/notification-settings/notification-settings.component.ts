import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { EditorModule } from "primeng/editor";
import { DropdownModule } from "primeng/dropdown";
import { ToastModule } from "primeng/toast";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    EditorModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: 'notification-settings.component.html'
})
export class NotificationSettingsComponent implements OnInit {
  emailForm!: FormGroup;
  notificationForm!: FormGroup;
  smsForm!: FormGroup;
  saving = false;

  smsProviders = [
    { label: 'Twilio', value: 'twilio' },
    { label: 'Nexmo', value: 'nexmo' },
    { label: 'MessageBird', value: 'messagebird' }
  ];

  notificationTypes = [
    // Patient Related
    { label: 'Appointment Reminders', group: 'patient' },
    { label: 'Prescription Refills', group: 'patient' },
    { label: 'Lab Results', group: 'patient' },
    { label: 'Follow-up Care', group: 'patient' },
    
    // Staff Related
    { label: 'Schedule Changes', group: 'staff' },
    { label: 'Emergency Alerts', group: 'staff' },
    { label: 'Staff Meetings', group: 'staff' },
    { label: 'Inventory Alerts', group: 'staff' },
    
    // Administrative
    { label: 'System Updates', group: 'admin' },
    { label: 'Billing Updates', group: 'admin' },
    { label: 'Security Alerts', group: 'admin' },
    { label: 'Compliance Reminders', group: 'admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadSettings();
  }

  private initializeForms() {
    this.emailForm = this.fb.group({
      smtpServer: ['', Validators.required],
      smtpPort: ['', Validators.required],
      smtpUsername: ['', Validators.required],
      smtpPassword: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      senderName: ['', Validators.required],
      encryption: ['tls'],
      emailSignature: [''],
      emailTemplate: ['']
    });

    this.smsForm = this.fb.group({
      provider: [''],
      apiKey: [''],
      apiSecret: [''],
      senderId: [''],
      defaultCountryCode: ['+1']
    });

    this.notificationForm = this.fb.group({
      // Patient Notifications
      appointmentReminders: [true],
      appointmentRemindersTime: ['24'],
      prescriptionRefills: [true],
      labResults: [true],
      followUpCare: [true],

      // Staff Notifications
      scheduleChanges: [true],
      emergencyAlerts: [true],
      staffMeetings: [true],
      inventoryAlerts: [true],

      // Administrative Notifications
      systemUpdates: [true],
      billingUpdates: [true],
      securityAlerts: [true],
      complianceReminders: [true],

      // Delivery Preferences
      defaultChannel: ['email'],
      allowSMS: [true],
      allowEmail: [true],
      allowPush: [false],
      workingHoursOnly: [true],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['07:00']
    });
  }

  private loadSettings() {
    this.settingsService.getNotificationSettings().subscribe({
      next: (settings) => {
        if (settings.email) {
          this.emailForm.patchValue(settings.email);
        }
        if (settings.sms) {
          this.smsForm.patchValue(settings.sms);
        }
        if (settings.notifications) {
          this.notificationForm.patchValue(settings.notifications);
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load notification settings'
        });
      }
    });
  }

  saveEmailSettings() {
    if (this.emailForm.invalid) return;

    this.saving = true;
    this.settingsService.updateNotificationSettings({
      email: this.emailForm.value
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Email settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update email settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  saveSMSSettings() {
    if (this.smsForm.invalid) return;

    this.saving = true;
    this.settingsService.updateNotificationSettings({
      sms: this.smsForm.value
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'SMS settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update SMS settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  saveNotificationSettings() {
    if (this.notificationForm.invalid) return;

    this.saving = true;
    this.settingsService.updateNotificationSettings({
      notifications: this.notificationForm.value
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Notification settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update notification settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  testEmailSettings() {
    if (this.emailForm.invalid) return;

    this.settingsService.testEmailSettings(this.emailForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Test email sent successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send test email'
        });
      }
    });
  }

  testSMSSettings() {
    if (this.smsForm.invalid) return;

    this.settingsService.testSMSSettings(this.smsForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Test SMS sent successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send test SMS'
        });
      }
    });
  }
}