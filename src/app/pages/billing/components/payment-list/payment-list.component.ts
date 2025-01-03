// src/app/pages/billing/components/payment-list/payment-list.component.ts
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { BillingService } from "../../services/billing.service";

interface PaymentFilters {
  status: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  paymentMethod: string | null;
  search: string;
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    FormsModule
  ],
  templateUrl: 'payment-list.component.html'
})
export class PaymentListComponent implements OnInit {
  payments: any[] = [];
  loading = false;

  filters: PaymentFilters = {
    status: null,
    dateFrom: null,
    dateTo: null,
    paymentMethod: null,
    search: ''
  };

  statusOptions = [
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' }
  ];

  paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit/Debit Card', value: 'card' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Insurance', value: 'insurance' }
  ];

  constructor(
    private billingService: BillingService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  private loadPayments() {
    this.loading = true;
    this.billingService.getPayments(this.filters).subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load payments'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.loadPayments();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[status] || ''}`;
  }

  getTotalAmount(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  exportPayments() {
    // Implement export functionality
  }

  printReceipt(payment: any) {
    // Implement print functionality
  }
}