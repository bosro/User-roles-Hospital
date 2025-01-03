import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { BillingService } from "../../services/billing.service";
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule, 
    DropdownModule,
    CalendarModule,
    TableModule,
    ToastModule
  ],
  templateUrl: 'invoice-form.component.html'
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm!: FormGroup;
  isEditMode = false;
  loading = false;

  patients: any[] = [];
  doctors: any[] = [];
  itemTypes = [
    { label: 'Consultation', value: 'consultation' },
    { label: 'Procedure', value: 'procedure' },
    { label: 'Medicine', value: 'medicine' },
    { label: 'Lab', value: 'lab' },
    { label: 'Other', value: 'other' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadPatients();
    this.loadDoctors();
    this.checkEditMode();
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  private initializeForm() {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [''],
      dateIssued: [new Date(), Validators.required],
      dueDate: [null, Validators.required],
      patientId: ['', Validators.required],
      patientName: [''],
      doctorId: ['', Validators.required],
      doctorName: [''],
      department: [''],
      items: this.fb.array([]),
      subtotal: [0],
      tax: [0],
      discount: [0],
      total: [0],
      notes: [''],
      insuranceClaim: this.fb.group({
        provider: [''],
        policyNumber: [''],
        coverageAmount: [0],
        status: ['pending']
      })
    });

    // Add first item by default
    this.addItem();
  }

  createItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      type: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      amount: [0],
      code: ['']
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  calculateItemAmount(index: number) {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    item.patchValue({ amount: quantity * unitPrice }, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals() {
    const subtotal = this.items.controls.reduce(
      (sum, item) => sum + (item.get('amount')?.value || 0), 0
    );
    const tax = subtotal * 0.1; // 10% tax
    const discount = this.invoiceForm.get('discount')?.value || 0;
    const total = subtotal + tax - discount;

    this.invoiceForm.patchValue({
      subtotal,
      tax,
      total
    });
  }

  onPatientChange(event: any) {
    const patient = this.patients.find(p => p.id === event.value);
    if (patient) {
      this.invoiceForm.patchValue({
        patientName: patient.name
      });
    }
  }

  onDoctorChange(event: any) {
    const doctor = this.doctors.find(d => d.id === event.value);
    if (doctor) {
      this.invoiceForm.patchValue({
        doctorName: doctor.name,
        department: doctor.department
      });
    }
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadInvoice(id);
    } else {
      this.generateInvoiceNumber();
    }
  }

  private generateInvoiceNumber() {
    this.billingService.generateInvoiceNumber().subscribe({
      next: (number) => {
        this.invoiceForm.patchValue({ invoiceNumber: number });
      }
    });
  }

  private loadInvoice(id: string) {
    this.loading = true;
    this.billingService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        // Clear default item
        while (this.items.length) {
          this.items.removeAt(0);
        }

        // Add invoice items
        invoice.items.forEach(item => {
          this.items.push(this.fb.group(item));
        });

        this.invoiceForm.patchValue(invoice);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load invoice'
        });
        this.loading = false;
      }
    });
  }

  saveAsDraft() {
    if (this.invoiceForm.invalid) return;
    
    const invoiceData = {
      ...this.invoiceForm.value,
      status: 'draft'
    };

    this.saveInvoice(invoiceData);
  }

  onSubmit() {
    if (this.invoiceForm.invalid) return;
    
    const invoiceData = {
      ...this.invoiceForm.value,
      status: 'pending'
    };

    this.saveInvoice(invoiceData);
  }

  private saveInvoice(invoiceData: any) {
    this.loading = true;
    const operation = this.isEditMode
      ? this.billingService.updateInvoice(this.route.snapshot.params['id'], invoiceData)
      : this.billingService.createInvoice(invoiceData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Invoice ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} invoice`
        });
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private loadPatients() {
    // Load patients from service
  }

  private loadDoctors() {
    // Load doctors from service
  }
}