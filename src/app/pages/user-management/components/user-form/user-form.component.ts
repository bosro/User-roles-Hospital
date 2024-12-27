import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { User } from "../../models/user.model";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { PasswordModule } from "primeng/password";
import { FileUploadModule } from "primeng/fileupload";

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    PasswordModule,
    FileUploadModule
  ],
  templateUrl: 'user-form.component.html'
})
export class UserFormComponent implements OnInit {
  @Input() user?: User;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  userForm: FormGroup;
  isEditMode = false;

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Nurse', value: 'nurse' },
    { label: 'Staff', value: 'staff' },
    { label: 'Receptionist', value: 'receptionist' }
  ];

  departments = [
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' },
    { label: 'Orthopedics', value: 'orthopedics' }
  ];

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' }
  ];

  permissions = [
    { label: 'View Patients', value: 'view_patients' },
    { label: 'Edit Patients', value: 'edit_patients' },
    { label: 'View Appointments', value: 'view_appointments' },
    { label: 'Edit Appointments', value: 'edit_appointments' },
    { label: 'View Reports', value: 'view_reports' },
    { label: 'Generate Reports', value: 'generate_reports' },
    { label: 'View Inventory', value: 'view_inventory' },
    { label: 'Manage Inventory', value: 'manage_inventory' }
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.user) {
      this.isEditMode = true;
      this.userForm.patchValue(this.user);
    }
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: [''],
      status: ['active', Validators.required],
      permissions: [[]],
      password: ['', !this.isEditMode ? [Validators.required, Validators.minLength(8)] : []],
      confirmPassword: ['', !this.isEditMode ? Validators.required : []]
    }, { validator: this.isEditMode ? null : this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password?.value === confirmPassword?.value ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  passwordMismatch(): boolean {
    return this.userForm.hasError('mismatch') && 
           this.userForm.get('confirmPassword')?.touched;
  }

  onImageUpload(event: any) {
    const file = event.files[0];
    // Handle image upload
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    const userData = this.userForm.value;
    this.save.emit(userData);
  }
}
