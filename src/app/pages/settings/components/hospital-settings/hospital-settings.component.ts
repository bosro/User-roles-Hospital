import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { FileUploadModule } from "primeng/fileupload";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { ToastModule } from "primeng/toast";
import { SettingsService } from "../../services/settings.service";
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-hospital-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FileUploadModule,
    ToastModule
  ],
  templateUrl: 'hospital-settings.component.html'
})
export class HospitalSettingsComponent implements OnInit {
  hospitalForm!: FormGroup;
  saving = false;
  logoPreview: string | null = null;

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
    this.hospitalForm = this.fb.group({
      name: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      tagline: [''],
      description: [''],
      contact: this.fb.group({
        phone: ['', Validators.required],
        emergency: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        website: ['']
      }),
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      socialMedia: this.fb.group({
        facebook: [''],
        twitter: [''],
        linkedin: [''],
        instagram: ['']
      })
    });
  }

  private loadSettings() {
    this.settingsService.getHospitalSettings().subscribe({
      next: (settings) => {
        this.hospitalForm.patchValue(settings);
        this.logoPreview = settings.logo;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load hospital settings'
        });
      }
    });
  }

  onLogoUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.hospitalForm.invalid) return;

    this.saving = true;
    const formData = {
      ...this.hospitalForm.value,
      logo: this.logoPreview
    };

    this.settingsService.updateHospitalSettings(formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Hospital settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update hospital settings'
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  resetForm() {
    this.hospitalForm.reset();
    this.loadSettings();
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Settings reset to last saved values'
    });
  }
}
