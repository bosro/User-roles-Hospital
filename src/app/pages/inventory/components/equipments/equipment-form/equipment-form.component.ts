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
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Equipment } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-equipment-form',
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
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: 'equipment-form.component.html'
})
export class EquipmentFormComponent implements OnInit {
  equipmentForm!: FormGroup;
  isEditMode = false;
  loading = false;

  conditions = [
    { label: 'New', value: 'New' },
    { label: 'Good', value: 'Good' },
    { label: 'Fair', value: 'Fair' },
    { label: 'Poor', value: 'Poor' }
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
    this.equipmentForm = this.fb.group({
      name: ['', Validators.required],
      model: ['', Validators.required],
      serialNumber: ['', Validators.required],
      manufacturer: ['', Validators.required],
      condition: ['', Validators.required],
      maintenanceDue: [null, Validators.required],
      calibrationDue: [null],
      warrantyExpiry: [null],
      location: ['', Validators.required],
      price: [0],
      notes: ['']
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadEquipment(id);
    }
  }

  private loadEquipment(id: string) {
    this.loading = true;
    this.inventoryService.getEquipmentById(id).subscribe({
      next: (equipment) => {
        // Form expects specific field names
        this.equipmentForm.patchValue({
          name: equipment.name,
          model: equipment.model,
          serialNumber: equipment.serialNumber,
          manufacturer: equipment.manufacturer,
          condition: equipment.condition,
          maintenanceDue: equipment.maintenanceDue ? new Date(equipment.maintenanceDue) : null,
          calibrationDue: equipment.calibrationDue ? new Date(equipment.calibrationDue) : null,
          warrantyExpiry: equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry) : null,
          location: equipment.location,
          price: equipment.price || 0,
          notes: equipment.notes || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load equipment details'
        });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.equipmentForm.invalid) return;

    this.loading = true;
    const equipmentData = this.equipmentForm.value;

    const operation = this.isEditMode
      ? this.inventoryService.updateEquipment(this.route.snapshot.params['id'], equipmentData)
      : this.inventoryService.createEquipment(equipmentData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Equipment ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} equipment`
        });
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}