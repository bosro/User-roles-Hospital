import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
// import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PurchaseOrder } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-reorder-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    // InputTextareaModule,
    CalendarModule
  ],
  template: `
    <div class="p-4">
      <form [formGroup]="orderForm" (ngSubmit)="submitOrder()">
        <div class="space-y-4">
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">Item</label>
            <div class="text-lg font-medium">{{item?.name}}</div>
            <div class="text-sm text-gray-500">{{item?.code}} - Current Stock: {{item?.quantity}} {{item?.unit}}</div>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantity to Order <span class="text-red-500">*</span>
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
              Expected Delivery Date
            </label>
            <p-calendar
              formControlName="expectedDate"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              [style]="{'width':'100%'}"
              styleClass="w-full">
            </p-calendar>
          </div>
          
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea 
              pInputTextarea 
              formControlName="notes"
              rows="3"
              placeholder="Enter any additional notes"
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
            label="Submit Order"
            icon="ri-shopping-cart-fill"
            type="submit"
            [loading]="loading"
            [disabled]="orderForm.invalid || loading">
          </p-button>
        </div>
      </form>
    </div>
  `
})
export class ReorderDialogComponent implements OnInit {
  orderForm!: FormGroup;
  item: any;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private inventoryService: InventoryService
  ) {}
  
  ngOnInit() {
    this.item = this.config.data?.item;
    
    this.orderForm = this.fb.group({
      quantity: [this.getSuggestedOrderQuantity(), [Validators.required, Validators.min(1)]],
      expectedDate: [this.getDefaultExpectedDate()],
      notes: ['']
    });
  }
  
  getSuggestedOrderQuantity(): number {
    if (!this.item) return 0;
    // Suggest ordering enough to reach twice the reorder level
    return Math.max(1, (this.item.reorderLevel * 2) - this.item.quantity);
  }
  
  getDefaultExpectedDate(): Date {
    // Default to 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }
  
  submitOrder() {
    if (this.orderForm.invalid || !this.item) return;
    
    this.loading = true;
    
    // const order: PurchaseOrder = {
    //   itemId: this.item._id || this.item.id,
    //   itemType: 'medicine', // Assuming medicine for this example
    //   quantity: this.orderForm.value.quantity,
    //   status: 'pending',
    //   requestedBy: 'Current User', // This would normally come from auth service
    //   requestedDate: new Date(),
    //   notes: this.orderForm.value.notes
    // };
    
    // In a real app, you would call a service to create a purchase order
    // For this example, we'll just close the dialog with the order data
    // setTimeout(() => {
    //   this.loading = false;
    //   this.ref.close(order);
    // }, 1000);
  }
  
  cancel() {
    this.ref.close();
  }
}