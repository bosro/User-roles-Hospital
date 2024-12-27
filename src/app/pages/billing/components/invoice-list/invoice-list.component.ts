import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { BillingService } from "../../services/billing.service";
import { Invoice } from "../../billing.model";
import { FormsModule } from "@angular/forms";
import { Dialog } from "primeng/dialog";

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
    Dialog
  ],
  templateUrl: 'invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  showPaymentDialog = false;
  selectedInvoice: Invoice | null = null;

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
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  private loadInvoices() {
    this.loading = true;
    this.billingService.getInvoices(this.filters).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
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

  applyFilters() {
    this.loadInvoices();
  }

  getStatusClass(status: string): string {
    return `px-2 py-1 rounded-full text-xs font-medium ${
      this.statusClasses[status as InvoiceStatus] || ''
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
    if (!invoice.id) return;
    
    this.billingService.deleteInvoice(invoice.id).subscribe({
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

  recordPayment(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showPaymentDialog = true;
  }

  getTotalAmount(): number {
    return this.invoices.reduce((sum, inv) => sum + inv.total, 0);
  }

  getOutstandingAmount(): number {
    return this.invoices.reduce((sum, inv) => sum + inv.balance, 0);
  }
}