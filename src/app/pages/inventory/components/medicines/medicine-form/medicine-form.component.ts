// src/app/pages/inventory/components/medicines/medicine-form/medicine-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Medicine } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    InputSwitchModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: 'medicine-form.component.html',
})
export class MedicineFormComponent implements OnInit {
  medicineForm!: FormGroup;
  isEditMode = false;
  loading = false;

  dosageForms = [
    { label: 'Tablet', value: 'tablet' },
    { label: 'Capsule', value: 'capsule' },
    { label: 'Syrup', value: 'syrup' },
    { label: 'Injection', value: 'injection' },
    { label: 'Cream', value: 'cream' },
    { label: 'Ointment', value: 'ointment' },
  ];

  units = [
    { label: 'Tablets', value: 'tablets' },
    { label: 'Bottles', value: 'bottles' },
    { label: 'Ampoules', value: 'ampoules' },
    { label: 'Tubes', value: 'tubes' },
    { label: 'Strips', value: 'strips' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.checkEditMode();
  }

  private initializeForm() {
    this.medicineForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      manufacturer: ['', Validators.required],
      dosageForm: ['', Validators.required],
      strength: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      batchNumber: ['', Validators.required],
      expiryDate: [null, Validators.required],
      price: [0],
      minStockLevel: [0],
      maxStockLevel: [0],
      reorderLevel: [0],
      storageConditions: [''],
      notes: [''],
      prescriptionRequired: [false],
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadMedicine(id);
    }
  }

  private loadMedicine(id: string) {
    this.loading = true;
    this.inventoryService.getMedicineById(id).subscribe({
      next: (medicine) => {
        this.medicineForm.patchValue(medicine);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load medicine details',
        });
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.medicineForm.invalid) return;

    this.loading = true;
    const medicineData = this.medicineForm.value;

    const operation = this.isEditMode
      ? this.inventoryService.updateMedicine(
          this.route.snapshot.params['id'],
          medicineData
        )
      : this.inventoryService.createMedicine(medicineData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Medicine ${
            this.isEditMode ? 'updated' : 'created'
          } successfully`,
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} medicine`,
        });
        this.loading = false;
      },
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

