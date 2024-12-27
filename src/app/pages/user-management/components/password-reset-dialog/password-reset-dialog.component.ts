import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from "@angular/forms";
import { User } from "../../models/user.model";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
import { CommonModule } from "@angular/common";
import { MessageModule } from 'primeng/message';

interface ResetFormData {
  password: string;
  confirmPassword: string;
  sendEmail: boolean;
  userId?: string;
}

@Component({
  selector: 'app-password-reset-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: 'password-reset-dialog.component.html'
})
export class PasswordResetDialogComponent {
  @Input() user: User | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() reset = new EventEmitter<ResetFormData>();

  resetForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      sendEmail: [true]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  passwordMismatch(): boolean {
    const confirmField = this.resetForm.get('confirmPassword');
    return this.resetForm.hasError('mismatch') && Boolean(confirmField?.touched);
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    const resetData: ResetFormData = {
      ...this.resetForm.value,
      userId: this.user?.id
    };

    this.reset.emit(resetData);
  }
}