import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { Invoice, Payment } from "../../billing.model";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { BillingService } from "../../services/billing.service";
import { TextareaModule } from 'primeng/textarea';

interface PaymentMethod {
  label: string;
  value: string;
}

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    InputNumberModule,
    DropdownModule,
    TextareaModule,
    ReactiveFormsModule
  ],
  templateUrl: 'invoice-details.component.html'
})
export class InvoiceDetailsComponent implements OnInit {
  invoice: Invoice | null = null;
  payments: Payment[] = [];
  showPaymentDialog = false;
  paymentLoading = false;
  paymentForm: FormGroup = this.initializePaymentForm();

  paymentMethods: PaymentMethod[] = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit/Debit Card', value: 'card' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Insurance', value: 'insurance' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private billingService: BillingService,
    private messageService: MessageService
  ) {
    this.initializePaymentForm();
  }

  ngOnInit() {
    this.loadInvoice();
  }

  private initializePaymentForm(): FormGroup {
    return this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['', Validators.required],
      transactionId: [''],
      notes: ['']
    });
  }


  private loadInvoice() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.billingService.getInvoiceById(id).subscribe({
        next: (invoice) => {
          this.invoice = invoice;
          this.loadPayments();
          if (invoice.balance) {
            this.paymentForm.patchValue({
              amount: invoice.balance
            });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load invoice details'
          });
        }
      });
    }
  }

  private loadPayments() {
    // Load payment history for this invoice
  }

  getStatusClass(status: string | undefined): string {
    const classes: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${status ? classes[status] || '' : ''}`;
  }

  getPaymentStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[status] || ''}`;
  }

  getDueDateClass(): string {
    if (!this.invoice) return '';
    const dueDate = new Date(this.invoice.dueDate);
    const today = new Date();
    return dueDate < today ? 'text-red-600' : 'text-gray-900';
  }

  getAmountClass(): string {
    if (!this.invoice) return '';
    return this.invoice.balance > 0 ? 'text-red-600' : 'text-green-600';
  }

  recordPayment() {
    if (this.paymentForm.invalid) return;

    this.paymentLoading = true;
    const payment = {
      ...this.paymentForm.value,
      invoiceId: this.invoice?.id,
      invoiceNumber: this.invoice?.invoiceNumber,
      patientId: this.invoice?.patientId,
      patientName: this.invoice?.patientName,
      paymentDate: new Date()
    };

    this.billingService.createPayment(payment).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment recorded successfully'
        });
        this.showPaymentDialog = false;
        this.loadInvoice();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to record payment'
        });
      },
      complete: () => {
        this.paymentLoading = false;
      }
    });
  }

  printInvoice() {
    window.print();
  }
}