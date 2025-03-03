import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Equipment, MaintenanceRecord } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [header]="'Schedule Maintenance - ' + (equipment?.name || '')"
      [modal]="true"
      [style]="{width: '500px'}"
      (onHide)="onDialogClosed()">
      
      <form [formGroup]="maintenanceForm" (ngSubmit)="onSubmit()" class="p-4">
        <div class="space-y-4">
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Type <span class="text-red-500">*</span>
            </label>
            <p-dropdown
              [options]="maintenanceTypes"
              formControlName="type"
              [style]="{'width':'100%'}"
              placeholder="Select maintenance type">
            </p-dropdown>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date <span class="text-red-500">*</span>
            </label>
            <p-calendar
              formControlName="date"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              [style]="{'width':'100%'}"
              styleClass="w-full">
            </p-calendar>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status <span class="text-red-500">*</span>
            </label>
            <p-dropdown
              [options]="statusOptions"
              formControlName="status"
              [style]="{'width':'100%'}"
              placeholder="Select status">
            </p-dropdown>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Performed By <span class="text-red-500">*</span>
            </label>
            <input 
              pInputText 
              formControlName="performedBy" 
              placeholder="Enter name of technician"
              class="w-full" />
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cost
            </label>
            <p-inputNumber
              formControlName="cost"
              mode="currency"
              currency="USD"
              [minFractionDigits]="2"
              placeholder="Enter cost (if any)"
              styleClass="w-full">
            </p-inputNumber>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea 
              pInputTextarea 
              formControlName="notes"
              rows="3"
              placeholder="Enter maintenance notes"
              class="w-full">
            </textarea>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-4 pt-4 border-t">
          <p-button
            label="Cancel"
            severity="secondary"
            icon="ri-close-line"
            (onClick)="cancel()">
          </p-button>
          <p-button
            label="Schedule"
            icon="ri-calendar-check-line"
            type="submit"
            [loading]="loading"
            [disabled]="maintenanceForm.invalid || loading">
          </p-button>
        </div>
      </form>
    </p-dialog>
    
    <p-toast></p-toast>
  `
})
export class MaintenanceFormComponent implements OnInit {
  @Input() equipment: Equipment | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() maintenanceScheduled = new EventEmitter<void>();
  
  maintenanceForm!: FormGroup;
  loading = false;
  
  maintenanceTypes = [
    { label: 'Preventive', value: 'Preventive' },
    { label: 'Corrective', value: 'Corrective' },
    { label: 'Calibration', value: 'Calibration' },
    { label: 'Emergency', value: 'Emergency' }
  ];
  
  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  private initializeForm(): void {
    this.maintenanceForm = this.fb.group({
      type: ['Preventive', Validators.required],
      date: [new Date(), Validators.required],
      status: ['Pending', Validators.required],
      performedBy: ['', Validators.required],
      cost: [0],
      notes: ['']
    });
  }
  
  onSubmit(): void {
    if (this.maintenanceForm.invalid || !this.equipment?._id) return;
    
    this.loading = true;
    const formData = this.maintenanceForm.value;
    
    // const maintenanceRecord: Omit<MaintenanceRecord, '_id'> = {
    //   equipmentId: this.equipment._id,
    //   date: formData.date,
    //   type: formData.type,
    //   performedBy: formData.performedBy,
    //   status: formData.status,
    //   notes: formData.notes || '',
    //   cost: formData.cost
    // };
    
    // this.inventoryService.scheduleMaintenance(maintenanceRecord).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: 'Maintenance scheduled successfully'
    //     });
        
    //     // Update next maintenance date if this is a future maintenance
    //     if (new Date(formData.date) > new Date() && this.equipment?._id) {
    //       this.updateEquipmentMaintenanceDate(this.equipment._id, formData.date);
    //     } else {
    //       this.loading = false;
    //       this.maintenanceScheduled.emit();
    //       this.closeDialog();
    //     }
    //   },
    //   error: (error) => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to schedule maintenance'
    //     });
    //     this.loading = false;
    //   }
    // });
  }
  
  private updateEquipmentMaintenanceDate(equipmentId: string, newDate: Date): void {
    this.inventoryService.updateEquipment(equipmentId, { maintenanceDue: newDate }).subscribe({
      next: () => {
        this.loading = false;
        this.maintenanceScheduled.emit();
        this.closeDialog();
      },
      error: () => {
        // Maintenance record was created but equipment wasn't updated
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Maintenance scheduled but equipment details not updated'
        });
        this.loading = false;
        this.maintenanceScheduled.emit();
        this.closeDialog();
      }
    });
  }
  
  cancel(): void {
    this.closeDialog();
  }
  
  onDialogClosed(): void {
    this.maintenanceForm.reset({
      type: 'Preventive',
      date: new Date(),
      status: 'Pending',
      performedBy: '',
      cost: 0,
      notes: ''
    });
  }
  
  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}