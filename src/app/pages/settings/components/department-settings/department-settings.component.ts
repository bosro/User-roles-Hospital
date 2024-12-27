import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";
import { InputTextModule } from "primeng/inputtext";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SettingsService } from "../../services/settings.service";

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  description?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  workingHours?: string;
}

@Component({
  selector: 'app-department-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    DropdownModule,
    InputNumberModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: 'department-settings.component.html'
})
export class DepartmentSettingsComponent implements OnInit {
  departments: Department[] = [];
  departmentForm!: FormGroup;
  showDialog = false;
  editMode = false;
  saving = false;
  loading = false;
  selectedDepartment: Department | null = null;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Under Maintenance', value: 'maintenance' }
  ];

  locationOptions = [
    { label: 'Main Building', value: 'main' },
    { label: 'East Wing', value: 'east' },
    { label: 'West Wing', value: 'west' },
    { label: 'North Wing', value: 'north' },
    { label: 'South Wing', value: 'south' }
  ];

  filters = {
    status: null,
    location: null
  };

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadDepartments();
  }

  private initializeForm() {
    this.departmentForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern('^[A-Z0-9]+$')]],
      head: ['', Validators.required],
      status: ['active', Validators.required],
      capacity: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      location: [''],
      contactNumber: ['', Validators.pattern('^[0-9+-]+$')],
      email: ['', Validators.email],
      workingHours: ['']
    });
  }

  private loadDepartments() {
    this.loading = true;
    this.settingsService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments'
        });
        this.loading = false;
      }
    });
  }

  addDepartment() {
    this.editMode = false;
    this.selectedDepartment = null;
    this.departmentForm.reset({ status: 'active' });
    this.showDialog = true;
  }

  editDepartment(department: Department) {
    this.editMode = true;
    this.selectedDepartment = department;
    this.departmentForm.patchValue(department);
    this.showDialog = true;
  }

  confirmDelete(department: Department) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the department "${department.name}"?`,
      header: 'Confirm Delete',
      icon: 'ri-error-warning-line',
      accept: () => this.deleteDepartment(department.id)
    });
  }

  deleteDepartment(id: string) {
    this.settingsService.deleteDepartment(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Department deleted successfully'
        });
        this.loadDepartments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete department'
        });
      }
    });
  }

  saveDepartment() {
    if (this.departmentForm.invalid) {
      Object.keys(this.departmentForm.controls).forEach(key => {
        const control = this.departmentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.saving = true;
    const departmentData = this.departmentForm.value;
    
    const operation = this.editMode
      ? this.settingsService.updateDepartment(departmentData)
      : this.settingsService.addDepartment(departmentData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Department ${this.editMode ? 'updated' : 'added'} successfully`
        });
        this.loadDepartments();
        this.showDialog = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.editMode ? 'update' : 'add'} department`
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  toggleDepartmentStatus(department: Department) {
    const newStatus = department.status === 'active' ? 'inactive' : 'active';
    const updatedDepartment = { ...department, status: newStatus };

    this.settingsService.updateDepartment(updatedDepartment).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Department status updated to ${newStatus}`
        });
        this.loadDepartments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update department status'
        });
      }
    });
  }

  applyFilters() {
    // Implement client-side filtering
    // You could also implement server-side filtering by passing filters to loadDepartments()
    this.loadDepartments();
  }

  resetFilters() {
    this.filters = {
      status: null,
      location: null
    };
    this.loadDepartments();
  }

  validateField(fieldName: string): boolean {
    const field = this.departmentForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.departmentForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength']) return 'Value is too short';
      if (control.errors['pattern']) {
        if (fieldName === 'code') return 'Only uppercase letters and numbers are allowed';
        if (fieldName === 'contactNumber') return 'Invalid phone number format';
      }
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['min']) return 'Value must be 0 or greater';
    }
    return '';
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'info';
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.departmentForm.reset();
    this.selectedDepartment = null;
  }
}