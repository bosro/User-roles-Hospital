import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from "primeng/calendar";
import { MessageService } from "primeng/api";
import { PatientService } from "../services/patient.service";
import { Patient } from "../models/patients.model";
import { ChipModule } from "primeng/chip";

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    ChipModule
  ],
  templateUrl:'patient-form.component.html'
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isEditMode = false;
  patientId: string = '';
  saving = false;
  today = new Date();

  genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' }
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.patientId = id;
      this.loadPatient(id);
    }
  }

  private initForm() {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      gender: ['', [Validators.required]],
      bloodGroup: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      medicalHistory: this.fb.group({
        allergies: [[]],
        conditions: [[]],
        surgeries: [[]],
        medications: [[]]
      }),
      insurance: this.fb.group({
        provider: [''],
        policyNumber: [''],
        groupNumber: [''],
        expiryDate: [null]
      })
    });
  }

  addItem(field: string, value: string) {
    if (!value.trim()) return;
    const currentValues = this.patientForm.get(`medicalHistory.${field}`)?.value || [];
    if (!currentValues.includes(value.trim())) {
      this.patientForm.get(`medicalHistory.${field}`)?.setValue([...currentValues, value.trim()]);
    }
  }
  
  removeItem(field: string, value: string) {
    const currentValues = this.patientForm.get(`medicalHistory.${field}`)?.value || [];
    this.patientForm.get(`medicalHistory.${field}`)?.setValue(
      currentValues.filter((item: string) => item !== value)
    );
  }

  private loadPatient(id: string) {
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        console.log('Loaded patient data:', patient);
        // Patch the form with the patient data
        this.patientForm.patchValue(patient);
      },
      error: (err) => {
        console.error('Error loading patient:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patient data'
        });
        this.router.navigate(['/patients/list']);
      }
    });
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      Object.keys(this.patientForm.controls).forEach(key => {
        const control = this.patientForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
        if (key === 'medicalHistory' || key === 'insurance') {
          Object.keys((this.patientForm.get(key) as FormGroup)?.controls || {}).forEach(nestedKey => {
            const nestedControl = this.patientForm.get(`${key}.${nestedKey}`);
            if (nestedControl?.invalid) {
              nestedControl.markAsTouched();
            }
          });
        }
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      
      return;
    }

    this.saving = true;
    const patientData = this.patientForm.value;
    console.log('Submitting patient data:', patientData);

    const operation = this.isEditMode
      ? this.patientService.updatePatient(this.patientId, patientData)
      : this.patientService.createPatient(patientData);

    operation.subscribe({
      next: (response) => {
        console.log('Save response:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Patient successfully ${this.isEditMode ? 'updated' : 'created'}`
        });
        this.router.navigate(['/patients/list']);
      },
      error: (err) => {
        console.error('Save error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} patient`
        });
        this.saving = false;
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.patientForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.router.navigate(['/patients/list']);
  }
}