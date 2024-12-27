// src/app/pages/inventory/components/supplies/supplies-form/supplies-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { Supply } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-supplies-form',
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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: 'supplies-form.component.html'
})
export class SuppliesFormComponent implements OnInit {
  supplyForm!: FormGroup;
  isEditMode = false;
  loading = false;

  categories = [
    { label: 'Disposable', value: 'disposable' },
    { label: 'Reusable', value: 'reusable' },
    { label: 'Sterile', value: 'sterile' },
    { label: 'General', value: 'general' }
  ];

  units = [
    { label: 'Pieces', value: 'pcs' },
    { label: 'Boxes', value: 'boxes' },
    { label: 'Packs', value: 'packs' },
    { label: 'Rolls', value: 'rolls' },
    { label: 'Pairs', value: 'pairs' }
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
    this.supplyForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      minStockLevel: [0],
      maxStockLevel: [0],
      reorderLevel: [0],
      size: [''],
      material: [''],
      price: [0],
      location: [''],
      supplier: [''],
      sterile: [false],
      disposable: [false],
      notes: ['']
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadSupply(id);
    }
  }

  private loadSupply(id: string) {
    this.loading = true;
    this.inventoryService.getSupplyById(id).subscribe({
      next: (supply) => {
        this.supplyForm.patchValue(supply);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load supply details'
        });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.supplyForm.invalid) return;

    this.loading = true;
    const supplyData = this.supplyForm.value;

    const operation = this.isEditMode
      ? this.inventoryService.updateSupply(this.route.snapshot.params['id'], supplyData)
      : this.inventoryService.createSupply(supplyData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Supply ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} supply`
        });
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}