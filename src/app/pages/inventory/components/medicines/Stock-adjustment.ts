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
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { Medicine, StockMovement } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [header]="'Adjust Stock - ' + (medicine?.name || '')"
      [modal]="true"
      [style]="{width: '450px'}"
      (onHide)="onDialogClosed()">
      
      <form [formGroup]="adjustmentForm" (ngSubmit)="onSubmit()" class="p-4">
        <div class="space-y-4">
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type <span class="text-red-500">*</span>
            </label>
            <p-dropdown
              [options]="stockMovementTypes"
              formControlName="type"
              [style]="{'width':'100%'}"
              placeholder="Select movement type">
            </p-dropdown>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span class="text-red-500">*</span>
            </label>
            <p-inputNumber
              formControlName="quantity"
              [showButtons]="true"
              [min]="1"
              placeholder="Enter quantity"
              styleClass="w-full">
            </p-inputNumber>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reference <span class="text-red-500">*</span>
            </label>
            <input 
              pInputText 
              formControlName="reference" 
              placeholder="Enter reference/reason"
              class="w-full" />
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
        </div>
        
        <div class="flex justify-end gap-3 mt-4 pt-4 border-t">
          <p-button
            label="Cancel"
            severity="secondary"
            icon="ri-close-line"
            (onClick)="cancel()">
          </p-button>
          <p-button
            label="Save Adjustment"
            icon="ri-save-line"
            type="submit"
            [loading]="loading"
            [disabled]="adjustmentForm.invalid || loading">
          </p-button>
        </div>
      </form>
    </p-dialog>
    
    <p-toast></p-toast>
  `
})
export class StockAdjustmentComponent implements OnInit {
  @Input() medicine: Medicine | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() stockUpdated = new EventEmitter<void>();
  
  adjustmentForm!: FormGroup;
  loading = false;
  
  stockMovementTypes = [
    { label: 'Add Stock', value: 'IN' },
    { label: 'Remove Stock', value: 'OUT' }
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
    this.adjustmentForm = this.fb.group({
      type: ['IN', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reference: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.adjustmentForm.invalid || !this.medicine) return;
    
    this.loading = true;
    const formData = this.adjustmentForm.value;
    
    const stockMovement: Omit<StockMovement, '_id'> = {
      medicineId: this.medicine._id as string,
      type: formData.type,
      quantity: formData.quantity,
      reference: formData.reference,
      date: formData.date,
      updatedBy: 'Current User' // This would normally come from authentication service
    };
    
    // this.inventoryService.addStockMovement(stockMovement).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: 'Stock adjusted successfully'
    //     });
    //     this.loading = false;
    //     this.stockUpdated.emit();
    //     this.closeDialog();
    //   },
    //   error: (error) => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to adjust stock'
    //     });
    //     this.loading = false;
    //   }
    // });
  }
  
  cancel(): void {
    this.closeDialog();
  }
  
  onDialogClosed(): void {
    this.adjustmentForm.reset({
      type: 'IN',
      quantity: 1,
      reference: '',
      date: new Date()
    });
  }
  
  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}