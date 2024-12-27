import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { DropdownModule } from "primeng/dropdown";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: 'app-integration-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: 'integration-settings.component.html'
})
export class IntegrationSettingsComponent implements OnInit {
  integrationForm!: FormGroup;
  saving = false;

  integrationTypes = [
    { label: 'EHR Systems', value: 'ehr' },
    { label: 'Laboratory Systems', value: 'lab' },
    { label: 'Pharmacy Systems', value: 'pharmacy' },
    { label: 'Medical Imaging', value: 'imaging' }
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
    this.integrationForm = this.fb.group({
      ehr: this.fb.group({
        enabled: [false],
        provider: [''],
        apiKey: [''],
        apiEndpoint: [''],
        syncInterval: ['daily']
      }),
      laboratory: this.fb.group({
        enabled: [false],
        provider: [''],
        apiKey: [''],
        apiEndpoint: [''],
        autoSync: [true]
      }),
      pharmacy: this.fb.group({
        enabled: [false],
        provider: [''],
        apiKey: [''],
        apiEndpoint: ['']
      }),
      imaging: this.fb.group({
        enabled: [false],
        provider: [''],
        apiKey: [''],
        apiEndpoint: [''],
        storageType: ['cloud']
      })
    });
  }

  private loadSettings() {
    this.settingsService.getIntegrationSettings().subscribe({
      next: (settings) => {
        this.integrationForm.patchValue(settings);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load integration settings'
        });
      }
    });
  }

  saveSettings() {
    if (this.integrationForm.invalid) return;

    this.saving = true;
    this.settingsService.updateIntegrationSettings(this.integrationForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Integration settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update integration settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  testConnection(type: string) {
    this.settingsService.testIntegrationConnection(type).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${type.toUpperCase()} connection test successful`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to test ${type.toUpperCase()} connection`
        });
      }
    });
  }
}