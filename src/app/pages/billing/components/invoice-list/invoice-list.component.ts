import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DropdownModule } from "primeng/dropdown";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { BillingService } from "../../services/billing.service";
import { Invoice, Payment } from "../../billing.model";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputNumberModule } from "primeng/inputnumber";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { InputTextareaModule } from "primeng/inputtextarea";

type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
type InsuranceStatus = 'pending' | 'approved' | 'rejected';

interface PaymentMethod {
  label: string;
  value: string;
}

interface FilterOptions {
  status: InvoiceStatus | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  department: string | null;
  search: string;
}

interface StatusOption {
  label: string;
  value: InvoiceStatus;
}

interface DepartmentOption {
  label: string;
  value: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputNumberModule,
    // InputTextareaModule
  ],
  templateUrl: 'invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  showPaymentDialog = false;
  showViewDialog = false;
  showEditDialog = false;
  selectedInvoice: Invoice | null = null;
  paymentForm: FormGroup;
  editForm: FormGroup;
  
  paymentMethods: PaymentMethod[] = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'Insurance', value: 'insurance' },
    { label: 'Bank Transfer', value: 'bank_transfer' }
  ];

  filters: FilterOptions = {
    status: null,
    dateFrom: null,
    dateTo: null,
    department: null,
    search: ''
  };

  statusOptions: StatusOption[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  departments: DepartmentOption[] = [
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Orthopedics', value: 'orthopedics' },
    { label: 'Pediatrics', value: 'pediatrics' }
  ];

  private readonly statusClasses: Record<InvoiceStatus, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };

  private readonly insuranceStatusClasses: Record<InsuranceStatus, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  constructor(
    private billingService: BillingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentDate: [new Date(), Validators.required],
      paymentMethod: ['cash', Validators.required],
      reference: [''],
      notes: ['']
    });
    
    this.editForm = this.fb.group({
      issueDate: [null, Validators.required],
      dueDate: [null, Validators.required],
      status: ['', Validators.required],
      notes: [''],
      discount: [0, [Validators.min(0)]],
      tax: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadInvoices();
  }

  private loadInvoices() {
    this.loading = true;
    this.billingService.getInvoices(this.filters).subscribe({
      next: (response: ApiResponse<Invoice[]>) => {
        if (response.success) {
          this.invoices = this.processInvoices(response.data);
          this.loading = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load invoices'
          });
          this.loading = false;
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load invoices'
        });
        this.loading = false;
      }
    });
  }

  // Process the invoice data to match our component model
  private processInvoices(data: any[]): Invoice[] {
    return data.map(invoice => {
      // Handle date formats
      const dateIssued = invoice.issueDate || invoice.dateIssued;
      const total = invoice.totalAmount || invoice.total;
      
      return {
        id: invoice._id,
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        patient: invoice.patient,
        doctor: invoice.doctor,
        dateIssued: new Date(dateIssued),
        dueDate: new Date(invoice.dueDate),
        total: total,
        totalAmount: total,
        balance: this.calculateBalance(invoice), // Calculate based on payments
        status: invoice.status,
        notes: invoice.notes,
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        discount: invoice.discount,
        insuranceClaim: invoice.insuranceClaim || null // Insurance claim if exists
      };
    });
  }

  // Get patient full name - handles both nested object and ID
  getPatientFullName(invoice: Invoice): string {
    if (invoice.patient) {
      return `${invoice.patient.firstName} ${invoice.patient.lastName}`;
    } else {
      return 'Unknown Patient';
    }
  }

  // Get doctor full name - handles both nested object and ID
  getDoctorFullName(invoice: Invoice): string {
    if (invoice.doctor) {
      return `${invoice.doctor.firstName} ${invoice.doctor.lastName}`;
    } else {
      return 'Unknown Doctor';
    }
  }

  // Calculate balance - replace with actual implementation
  private calculateBalance(invoice: any): number {
    // This would calculate the remaining balance based on payments
    // For now, return the total amount
    return invoice.totalAmount || invoice.total || 0;
  }

  applyFilters() {
    this.loadInvoices();
  }

  getStatusClass(status: string): string {
    const normalizedStatus = status.toLowerCase() as InvoiceStatus;
    return `px-2 py-1 rounded-full text-xs font-medium ${
      this.statusClasses[normalizedStatus] || ''
    }`;
  }

  getBalanceClass(invoice: Invoice): string {
    return invoice.balance > 0 ? 'text-red-600' : 'text-green-600';
  }

  getInsuranceStatusClass(status: string): string {
    return `px-2 py-1 rounded-full text-xs font-medium ${
      this.insuranceStatusClasses[status as InsuranceStatus] || ''
    }`;
  }

  confirmDelete(invoice: Invoice) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`,
      accept: () => {
        this.deleteInvoice(invoice);
      }
    });
  }

  deleteInvoice(invoice: Invoice) {
    if (!invoice.id && !invoice._id) return;
    
    const id = invoice.id || invoice._id;
    this.billingService.deleteInvoice(id as string).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice deleted successfully'
        });
        this.loadInvoices();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete invoice'
        });
      }
    });
  }

  viewInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showViewDialog = true;
  }

  editInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.editForm.patchValue({
      issueDate: new Date(invoice.dateIssued),
      dueDate: new Date(invoice.dueDate),
      status: invoice.status.toLowerCase(),
      notes: invoice.notes,
      discount: invoice.discount,
      tax: invoice.tax
    });
    this.showEditDialog = true;
  }

  saveInvoiceEdit() {
    if (!this.selectedInvoice || (!this.selectedInvoice.id && !this.selectedInvoice._id) || !this.editForm.valid) return;
    
    const updatedInvoice = {
      issueDate: this.editForm.value.issueDate,
      dueDate: this.editForm.value.dueDate,
      status: this.editForm.value.status,
      notes: this.editForm.value.notes,
      discount: this.editForm.value.discount,
      tax: this.editForm.value.tax
    };
    
    const id = this.selectedInvoice.id || this.selectedInvoice._id;
    this.billingService.updateInvoice(id as string, updatedInvoice).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice updated successfully'
        });
        this.showEditDialog = false;
        this.loadInvoices();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update invoice'
        });
      }
    });
  }

  recordPayment(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.paymentForm.patchValue({
      amount: invoice.balance,
      paymentDate: new Date()
    });
    this.showPaymentDialog = true;
  }

  submitPayment() {
    if (!this.selectedInvoice || (!this.selectedInvoice.id && !this.selectedInvoice._id) || !this.paymentForm.valid) return;
    
    const payment: Omit<any, '_id'> = {
      invoiceId: this.selectedInvoice.id || this.selectedInvoice._id,
      invoiceNumber: this.selectedInvoice.invoiceNumber,
      patientId: this.selectedInvoice.patient?._id || this.selectedInvoice.patientId,
      patientName: this.selectedInvoice.patient ? 
        `${this.selectedInvoice.patient.firstName} ${this.selectedInvoice.patient.lastName}` : 
        'Unknown Patient',
      amount: this.paymentForm.value.amount,
      paymentDate: this.paymentForm.value.paymentDate,
      paymentMethod: this.paymentForm.value.paymentMethod,
      reference: this.paymentForm.value.reference,
      status: 'completed',
      notes: this.paymentForm.value.notes
    };
    
    this.billingService.createPayment(payment).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment recorded successfully'
        });
        this.showPaymentDialog = false;
        this.loadInvoices();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to record payment'
        });
      }
    });
  }

  getTotalAmount(): number {
    return this.invoices.reduce((sum, inv) => sum + (inv.total || inv.totalAmount || 0), 0);
  }

  getOutstandingAmount(): number {
    return this.invoices.reduce((sum, inv) => sum + inv.balance, 0);
  }
}