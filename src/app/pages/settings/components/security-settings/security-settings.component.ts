import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { ToastModule } from "primeng/toast";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    InputNumberModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: 'security-settings.component.html'
})
export class SecuritySettingsComponent implements OnInit {
  securityForm!: FormGroup;
  saving = false;

  sessionTimeouts = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 }
  ];

  mfaTypes = [
    { label: 'SMS', value: 'sms' },
    { label: 'Email', value: 'email' },
    { label: 'Authenticator App', value: 'authenticator' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadSettings();
  }

  private initializeForm() {
    this.securityForm = this.fb.group({
      password: this.fb.group({
        minLength: [8, [Validators.required, Validators.min(8)]],
        requireUppercase: [true],
        requireLowercase: [true],
        requireNumbers: [true],
        requireSpecialChars: [true],
        expiryDays: [90],
        preventReuse: [true],
        reuseCount: [5]
      }),
      session: this.fb.group({
        timeout: [30],
        maxConcurrent: [3],
        rememberMe: [true]
      }),
      mfa: this.fb.group({
        enabled: [false],
        type: ['authenticator'],
        requiredRoles: ['admin']
      }),
      security: this.fb.group({
        ipWhitelisting: [false],
        whitelistedIPs: [''],
        failedAttempts: [5],
        lockoutDuration: [30],
        passwordlessLogin: [false],
        auditLogging: [true]
      })
    });
  }

  private loadSettings() {
    this.settingsService.getSecuritySettings().subscribe({
      next: (settings) => {
        this.securityForm.patchValue(settings);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load security settings'
        });
      }
    });
  }

  saveSettings() {
    if (this.securityForm.invalid) return;

    this.saving = true;
    this.settingsService.updateSecuritySettings(this.securityForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Security settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update security settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  resetToDefault() {
    if (confirm('Are you sure you want to reset all security settings to default values?')) {
      this.settingsService.resetSecuritySettings().subscribe({
        next: () => {
          this.loadSettings();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Security settings reset to default values'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reset security settings'
          });
        }
      });
    }
  }
}