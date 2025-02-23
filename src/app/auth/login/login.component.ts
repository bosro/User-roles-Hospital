import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Button,
    CardModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });

    // Check if 'remember me' info is available in localStorage
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      this.loginForm.get('email')?.setValue(savedEmail);
      this.loginForm.get('rememberMe')?.setValue(true);
    }
  }

  onRememberMeChange(event: CheckboxChangeEvent) {
    this.loginForm.get('rememberMe')?.setValue(event.checked);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: () => {
          // If 'remember me' is checked, save the email to localStorage
          if (this.loginForm.get('rememberMe')?.value) {
            localStorage.setItem('email', email);
          } else {
            localStorage.removeItem('email'); // Remove from storage if not checked
          }

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred during login';
          this.isLoading = false;
        },
      });
    }
  }
}
