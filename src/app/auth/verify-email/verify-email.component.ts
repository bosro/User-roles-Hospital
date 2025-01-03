// verify-email.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule
  ],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <p-card>
        <div class="text-center mb-8">
          <img src="assets/images/logo.png" alt="Healthcare Logo" class="mx-auto h-12 w-auto mb-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
          <p class="text-sm text-gray-600" *ngIf="!token">
            Please check your email for the verification link we sent you.
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center space-y-4">
          <div class="animate-spin mx-auto">
            <i class="pi pi-spinner text-4xl text-blue-600"></i>
          </div>
          <p class="text-sm text-gray-600">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div *ngIf="isVerified" class="text-center space-y-6">
          <div class="rounded-full bg-green-100 p-4 w-16 h-16 mx-auto">
            <i class="pi pi-check text-3xl text-green-500"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">Email verified successfully!</h3>
            <p class="text-sm text-gray-600">You can now sign in to your account.</p>
          </div>
          <p-button 
            label="Sign In" 
            styleClass="w-full"
            routerLink="/auth/login">
          </p-button>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="text-center space-y-6">
          <div class="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto">
            <i class="pi pi-times text-3xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">Verification failed</h3>
            <p class="text-sm text-gray-600">{{error}}</p>
          </div>
          <div class="space-y-3">
            <p-button 
              label="Try Again" 
              styleClass="w-full"
              (onClick)="verifyEmail()">
            </p-button>
            <p class="text-sm">
              Didn't receive the email?
              <a (click)="resendVerification()" class="text-blue-600 hover:text-blue-500 cursor-pointer ml-1">
                Resend verification email
              </a>
            </p>
          </div>
        </div>

        <!-- Initial State (No token) -->
        <div *ngIf="!token && !isLoading && !isVerified && !error" class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <i class="pi pi-info-circle text-blue-500 mt-0.5 mr-3"></i>
              <div class="text-sm text-blue-700">
                <p>We've sent a verification link to your email address. Click the link to verify your account.</p>
                <p class="mt-2">If you don't see the email, check your spam folder.</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <p class="text-sm text-center">
              Didn't receive the email?
              <a (click)="resendVerification()" class="text-blue-600 hover:text-blue-500 cursor-pointer ml-1">
                Resend verification email
              </a>
            </p>

            <div class="border-t border-gray-200 pt-4">
              <a routerLink="/auth/login" class="text-sm flex items-center justify-center font-medium text-blue-600 hover:text-blue-500">
                <i class="pi pi-arrow-left mr-1"></i>
                Back to login
              </a>
            </div>
          </div>
        </div>

        <!-- Resend Success Message -->
        <div *ngIf="resendSuccess" 
          class="mt-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          <div class="flex">
            <i class="pi pi-check-circle mr-2"></i>
            Verification email has been resent. Please check your inbox.
          </div>
        </div>

      </p-card>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  isLoading = false;
  isVerified = false;
  error: string | null = null;
  token: string | null = null;
  resendSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.verifyEmail();
    }
  }

  verifyEmail() {
    if (!this.token) return;
    
    this.isLoading = true;
    this.error = null;

    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.isVerified = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Verification failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  resendVerification() {
    this.isLoading = true;
    this.error = null;
    this.resendSuccess = false;

    this.authService.resendVerificationEmail().subscribe({
      next: () => {
        this.resendSuccess = true;
        this.isLoading = false;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.resendSuccess = false;
        }, 5000);
      },
      error: (error) => {
        this.error = error.message || 'Failed to resend verification email. Please try again.';
        this.isLoading = false;
      }
    });
  }
}