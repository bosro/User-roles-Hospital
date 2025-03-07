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
// import { InputTextareaModule } from "primeng/inputtextarea";
import { DoctorService } from "../../../doctors/services/doctor.service"; // Assuming this service exists
import { PatientService } from "../../../patients/services/patient.service"; // Assuming this service exists

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

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
    // InputTextareaModule,
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
  
  categories = [
    { label: 'Medical Service', value: 'Medical Service' },
    { label: 'Surgery', value: 'Surgery' },
    { label: 'Laboratory', value: 'Laboratory' },
    { label: 'Pharmacy', value: 'Pharmacy' },
    { label: 'Radiology', value: 'Radiology' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private doctorService: DoctorService,
    private patientService: PatientService,
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
    // Set default due date (14 days from today)
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    this.invoiceForm = this.fb.group({
      invoiceNumber: [''],
      category: ['Medical Service', Validators.required],
      issueDate: [today, Validators.required],
      dueDate: [dueDate, Validators.required],
      patient: ['', Validators.required],
      doctor: ['', Validators.required],
      items: this.fb.array([], Validators.required),
      subtotal: [0],
      tax: [0],
      discount: [0],
      totalAmount: [0],
      notes: ['']
    });

    // Add first item by default
    this.addItem();
  }

  createItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      amount: [0]
    });
  }

  addItem() {
    this.items.push(this.createItem());
    // Calculate totals when adding an item
    this.calculateTotals();
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
    // Calculate subtotal
    const subtotal = this.items.controls.reduce(
      (sum, item) => sum + (item.get('amount')?.value || 0), 0
    );
    
    // Calculate tax (10% of subtotal)
    const tax = subtotal * 0.1;
    
    // Get discount
    const discount = this.invoiceForm.get('discount')?.value || 0;
    
    // Calculate total
    const totalAmount = subtotal + tax - discount;

    this.invoiceForm.patchValue({
      subtotal,
      tax,
      totalAmount
    });
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
      next: (response: ApiResponse<string>) => {
        if (response.success) {
          this.invoiceForm.patchValue({ invoiceNumber: response.data });
        } else {
          // Generate a fallback invoice number
          const timestamp = new Date().getTime();
          this.invoiceForm.patchValue({ invoiceNumber: `INV-${timestamp}` });
        }
      },
      error: () => {
        // Generate a fallback invoice number
        const timestamp = new Date().getTime();
        this.invoiceForm.patchValue({ invoiceNumber: `INV-${timestamp}` });
      }
    });
  }

  private loadInvoice(id: string) {
    this.loading = true;
    this.billingService.getInvoiceById(id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          const invoice = response.data;
          
          // Clear default items
          while (this.items.length) {
            this.items.removeAt(0);
          }

          // Add invoice items
          if (invoice.items && invoice.items.length) {
            invoice.items.forEach((item: any) => {
              const itemGroup = this.createItem();
              itemGroup.patchValue(item);
              this.items.push(itemGroup);
            });
          } else {
            // Add at least one empty item
            this.addItem();
          }

          // Convert date strings to Date objects
          if (typeof invoice.issueDate === 'string') {
            invoice.issueDate = new Date(invoice.issueDate);
          }
          if (typeof invoice.dueDate === 'string') {
            invoice.dueDate = new Date(invoice.dueDate);
          }

          // Patch form with invoice data
          this.invoiceForm.patchValue({
            invoiceNumber: invoice.invoiceNumber,
            category: invoice.category || 'Medical Service',
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            patient: invoice.patient,
            doctor: invoice.doctor,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            discount: invoice.discount,
            totalAmount: invoice.totalAmount,
            notes: invoice.notes
          });

          this.calculateTotals();
          this.loading = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load invoice data'
          });
          this.loading = false;
        }
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
    if (this.invoiceForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }
    
    const invoiceData = this.prepareInvoiceData();
    // invoiceData.status = 'Draft';
    
    this.saveInvoice(invoiceData);
  }

  onSubmit() {
    if (this.invoiceForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }
    
    const invoiceData = this.prepareInvoiceData();
    // invoiceData.status = 'Pending';
    
    this.saveInvoice(invoiceData);
  }

  private prepareInvoiceData() {
    const formValue = this.invoiceForm.value;
    
    // Format dates to ISO string for API
    const issueDate = formValue.issueDate instanceof Date 
      ? formValue.issueDate.toISOString().split('T')[0] 
      : formValue.issueDate;
      
    const dueDate = formValue.dueDate instanceof Date 
      ? formValue.dueDate.toISOString().split('T')[0] 
      : formValue.dueDate;
    
    // Calculate subtotal based on items
    const subtotal = formValue.items.reduce((sum: number, item: any) => sum + item.amount, 0);
    
    return {
      category: formValue.category,
      issueDate: issueDate,
      dueDate: dueDate,
      patient: formValue.patient,
      doctor: formValue.doctor,
      items: formValue.items,
      subtotal: subtotal,
      tax: Math.round(subtotal * 0.1 * 100) / 100, // 10% tax, rounded to 2 decimals
      discount: formValue.discount || 0,
      totalAmount: (subtotal + (subtotal * 0.1) - (formValue.discount || 0)),
      notes: formValue.notes || '',
      invoiceNumber: formValue.invoiceNumber
    };
  }

  private saveInvoice(invoiceData: any) {
    this.loading = true;
    
    const operation = this.isEditMode
      ? this.billingService.updateInvoice(this.route.snapshot.params['id'], invoiceData)
      : this.billingService.createInvoice(invoiceData);

    operation.subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Invoice ${this.isEditMode ? 'updated' : 'created'} successfully`
          });
          this.router.navigate(['../'], { relativeTo: this.route });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${this.isEditMode ? 'update' : 'create'} invoice`
          });
          this.loading = false;
        }
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
    this.loading = true;
    this.patientService.getPatients('1').subscribe({
      next: (response:any) => {
        // Check if the response has the success/data structure
        if (response.success && Array.isArray(response.data)) {
          // Format patients for dropdown
          this.patients = response.data.map((patient:any) => ({
            label: `${patient.firstName} ${patient.lastName}`,
            value: patient._id || patient.id
          }));
        } else if (Array.isArray(response)) {
          // Direct array response
          this.patients = response.map(patient => ({
            label: `${patient.firstName} ${patient.lastName}`,
            value: patient._id || patient.id
          }));
        } else {
          console.error('Unexpected patient data format:', response);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process patient data'
          });
        }
        this.loading = false;
      },
      error: (error:any) => {
        console.error('Error loading patients:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patients'
        });
      }
    });
  }

  private loadDoctors() {
    this.loading = true;
    this.doctorService.getDoctors().subscribe({
      next: (response :any) => {
        // Check if the response has the success/data structure
        if (response.success && Array.isArray(response.data)) {
          // Format doctors for dropdown
          this.doctors = response.data.map((doctor:any) => ({
            label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            value: doctor._id || doctor.id,
            department: doctor.department
          }));
        } else if (Array.isArray(response)) {
          // Direct array response
          this.doctors = response.map(doctor => ({
            label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            value: doctor._id || doctor.id,
            department: doctor.department
          }));
        } else {
          console.error('Unexpected doctor data format:', response);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process doctor data'
          });
        }
        this.loading = false;
      },
      error: (error:any) => {
        console.error('Error loading doctors:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load doctors'
        });
      }
    });
  }
}