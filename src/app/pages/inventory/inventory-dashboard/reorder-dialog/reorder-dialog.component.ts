import { Component, Input, OnInit } from '@angular/core';
import { InventoryItem, PurchaseOrder } from '../../models/inventory.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-reorder-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    TextareaModule,
  ],
  templateUrl: 'reorder-dialog.component.html',
})
export class ReorderDialogComponent implements OnInit {
  @Input() item: any;
  orderForm: FormGroup;
  loading = false;
  minDate = new Date();

  urgencyOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'Critical', value: 'critical' },
  ];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private messageService: MessageService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      urgency: ['normal', Validators.required],
      expectedDelivery: [null],
      supplier: [''],
      notes: [''],
    });
  }

  ngOnInit() {
    if (this.config.data?.item) {
      this.item = this.config.data.item;
      this.orderForm.patchValue({
        quantity: this.item.reorderLevel - this.item.quantity,
        supplier: this.item.supplier // Pre-fill supplier if available
      });
    }
  }

  onSubmit() {
    if (this.orderForm.invalid) return;

    this.loading = true;

    const order: Omit<PurchaseOrder, 'id' | 'orderNumber'> = {
      itemId: this.item.id,
      itemType: this.getItemType(this.item),
      itemName: this.item.name,
      quantity: this.orderForm.value.quantity,
      unit: this.item.unit,
      status: 'pending',
      urgency: this.orderForm.value.urgency,
      requestedBy: 'Current User',
      requestDate: new Date(),
      expectedDelivery: this.orderForm.value.expectedDelivery,
      supplier: this.orderForm.value.supplier,
      notes: this.orderForm.value.notes,
      totalCost: this.item.price * this.orderForm.value.quantity // Calculate total cost
    };

    this.inventoryService.createPurchaseOrder(order).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Purchase order created successfully',
        });
        this.ref.close(response);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create purchase order',
        });
        this.loading = false;
      },
    });
  }

  private getItemType(item: InventoryItem): PurchaseOrder['itemType'] {
    return item.category;
  }

  onCancel() {
    this.ref.close();
  }
}
