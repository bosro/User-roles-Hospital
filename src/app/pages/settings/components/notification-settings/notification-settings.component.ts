import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { EditorModule } from "primeng/editor";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { SettingsService } from "../../services/settings.service";
import { Chip } from 'primeng/chip';

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
    DropdownModule,
    EditorModule,
    ToastModule
  ],
  templateUrl: 'notification-settings.component.html'
})
export class NotificationSettingsComponent implements OnInit {
  emailForm!: FormGroup;
  smsForm!: FormGroup;
  notificationRulesForm!: FormGroup;
  
  savingEmail = false;
  savingSms = false;
  savingRules = false;

  smsProviders = [
    { label: 'Twilio', value: 'twilio' },
    { label: 'Nexmo', value: 'nexmo' },
    { label: 'MessageBird', value: 'messagebird' },
    { label: 'AWS SNS', value: 'aws_sns' }
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
      smtp: this.fb.group({
        host: ['', Validators.required],
        port: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required]
      }),
      fromEmail: ['', [Validators.required, Validators.email]],
      signature: ['']
    });

    this.smsForm = this.fb.group({
      provider: ['', Validators.required],
      apiConfig: this.fb.group({
        apiKey: ['', Validators.required],
        apiSecret: ['', Validators.required]
      }),
      senderId: ['', Validators.required]
    });

    this.notificationRulesForm = this.fb.group({
      // Appointment notifications
      appointmentConfirmEmail: [true],
      appointmentConfirmSms: [true],
      appointmentReminderEmail: [true],
      appointmentReminderSms: [true],
      scheduleChangeEmail: [true],
      scheduleChangeSms: [true],
      
      // Billing notifications
      invoiceGeneratedEmail: [true],
      invoiceGeneratedSms: [false],
      paymentReceivedEmail: [true],
      paymentReceivedSms: [false],
      paymentDueEmail: [true],
      paymentDueSms: [true],
      
      // System notifications
      systemUpdateEmail: [true],
      securityAlertEmail: [true],
      securityAlertSms: [true],
      lowInventoryEmail: [true]
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
        if (settings.rules) {
          this.notificationRulesForm.patchValue(settings.rules);
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

    this.savingEmail = true;
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
        this.savingEmail = false;
      }
    });
  }

  saveSmsSettings() {
    if (this.smsForm.invalid) return;

    this.savingSms = true;
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
        this.savingSms = false;
      }
    });
  }

  saveNotificationRules() {
    this.savingRules = true;
    this.settingsService.updateNotificationSettings({
      rules: this.notificationRulesForm.value
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Notification rules updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update notification rules'
        });
      },
      complete: () => {
        this.savingRules = false;
      }
    });
  }
}