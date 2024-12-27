import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { SettingsService } from "../../services/settings.service";
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule
  ],
  templateUrl: 'general-settings.component.html'
})
export class GeneralSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  saving = false;

  timeZones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Eastern Time', value: 'America/New_York' },
    { label: 'Pacific Time', value: 'America/Los_Angeles' },
    // Add more time zones
  ];

  dateFormats = [
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
  ];

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' }
    // Add more languages
  ];

  themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System Default', value: 'system' }
  ];

  departments = [
    { label: 'Emergency', value: 'emergency' },
    { label: 'Outpatient', value: 'outpatient' },
    { label: 'Inpatient', value: 'inpatient' }
    // Add more departments
  ];

  currencies = [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' }
    // Add more currencies
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
    this.settingsForm = this.fb.group({
      systemName: ['', Validators.required],
      timeZone: ['', Validators.required],
      dateFormat: ['', Validators.required],
      language: ['', Validators.required],
      theme: ['light'],
      itemsPerPage: [10, [Validators.required, Validators.min(5)]],
      darkMode: [false],
      showHelpTips: [true],
      defaultDepartment: [''],
      currency: ['USD', Validators.required]
    });
  }

  private loadSettings() {
    this.settingsService.getGeneralSettings().subscribe({
      next: (settings) => {
        this.settingsForm.patchValue(settings);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load settings'
        });
      }
    });
  }

  onSubmit() {
    if (this.settingsForm.invalid) return;

    this.saving = true;
    this.settingsService.updateGeneralSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  resetForm() {
    this.settingsForm.reset();
    this.loadSettings();
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Settings reset to last saved values'
    });
  }
}
