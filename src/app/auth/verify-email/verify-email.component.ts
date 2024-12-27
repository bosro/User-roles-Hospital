import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="text-center">
      <img src="assets/images/logo.png" alt="Healthcare Logo" class="mx-auto h-12 w-auto mb-4">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Verify your email</h2>
      
      <div *ngIf="isVerifying" class="animate-pulse">
        <p class="text-gray-600">Verifying your email...</p>
      </div>

      <div *ngIf="!isVerifying">
        <div *ngIf="isSuccess" class="text-green-600">
          <p class="mb-4">Your email has been verified successfully!</p>
          <a routerLink="/auth/login" class="text-blue-600 hover:text-blue-500">
            Proceed to login
          </a>
        </div>

        <div *ngIf="error" class="text-red-600">
          <p class="mb-4">{{error}}</p>
          <a routerLink="/auth/login" class="text-blue-600 hover:text-blue-500">
            Back to login
          </a>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  isSuccess = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.verifyEmail(token);
    } else {
      this.error = 'Invalid verification link';
      this.isVerifying = false;
    }
  }

  private verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isSuccess = true;
        this.isVerifying = false;
      },
      error: (error) => {
        this.error = error.message || 'Verification failed';
        this.isVerifying = false;
      }
    });
  }
}