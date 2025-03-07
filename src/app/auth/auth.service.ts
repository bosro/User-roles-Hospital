import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, interval, Subscription } from 'rxjs';
import { catchError, tap, takeWhile } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { User } from '../pages/user-management/models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

interface AuthResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  sessionId?: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // Token keys for localStorage
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';
  private readonly SESSION_ID_KEY = 'sessionId';
  
  // BehaviorSubjects for reactive state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private jwtHelper = new JwtHelperService();
  private tokenExpirationTimer: Subscription | null = null;
  private alive = true;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ngZone: NgZone
  ) {
    // Initialize authentication state from localStorage
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.alive = false;
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.unsubscribe();
    }
  }

  /**
   * Check the authentication status when service is initialized
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      if (!this.jwtHelper.isTokenExpired(token)) {
        this.currentUserSubject.next(JSON.parse(userData));
        this.isAuthenticatedSubject.next(true);
        this.startTokenExpirationTimer(token);
      } else {
        // Token is expired, log the user out
        this.handleTokenExpiration();
      }
    } else {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Start a timer to check token expiration
   */
  private startTokenExpirationTimer(token: string): void {
    // Clean up existing timer if it exists
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.unsubscribe();
    }

    try {
      // Get token expiration time
      const decodedToken = this.jwtHelper.decodeToken(token);
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      
      if (expirationDate) {
        // Calculate time until expiration in milliseconds
        const timeUntilExpiration = expirationDate.getTime() - Date.now();
        
        // Time to show warning (e.g., 5 minutes before expiration)
        const warningTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (timeUntilExpiration > 0) {
          console.log(`Token will expire in ${timeUntilExpiration / 1000 / 60} minutes`);
          
          // Check token status every minute
          this.tokenExpirationTimer = interval(60000) // Check every minute
            .pipe(takeWhile(() => this.alive))
            .subscribe(() => {
              const token = this.getToken();
              if (!token || this.jwtHelper.isTokenExpired(token)) {
                this.handleTokenExpiration();
              }
            });
        } else {
          // Token is already expired
          this.handleTokenExpiration();
        }
      }
    } catch (error) {
      console.error('Error setting up token expiration timer:', error);
    }
  }

  /**
   * Handle token expiration
   */
  private handleTokenExpiration(): void {
    console.log('Token has expired, logging out');
    
    // Use NgZone to ensure Angular detects the change
    this.ngZone.run(() => {
      this.clearAuthData();
      this.router.navigate(['/auth/login'], {
        queryParams: { expired: true }
      });
    });
  }

  /**
   * Login with credentials and store authentication data
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/admin/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.tokens) {
            // Store tokens
            localStorage.setItem(this.TOKEN_KEY, response.tokens.accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
            
            // Store user data
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            
            // Store session ID if present
            if (response.sessionId) {
              localStorage.setItem(this.SESSION_ID_KEY, response.sessionId);
            }
            
            // Update subjects
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
            
            // Start token expiration timer
            this.startTokenExpirationTimer(response.tokens.accessToken);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get the current JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get the session ID
   */
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_ID_KEY);
  }

  /**
   * Get the current user ID
   */
  getCurrentUserId(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  /**
   * Get the current user role
   */
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  /**
   * Check if the user has a specific role
   */
  hasRole(role: string | string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  /**
   * Register a new user
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/register`, userData);
  }

  /**
   * Send password reset request
   */
  forgotPassword(email: string, newPassword: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/admin/forget-password`, { email, newPassword });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/admin/forget-password`, { token, password });
  }

  /**
   * Verify email with token
   */
  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verify-email`, { token });
  }
  
  /**
   * Resend verification email
   */
  resendVerificationEmail(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend-verification`, {});
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post(`${environment.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap((response: any) => {
          if (response.accessToken) {
            localStorage.setItem(this.TOKEN_KEY, response.accessToken);
            // Restart the token expiration timer with the new token
            this.startTokenExpirationTimer(response.accessToken);
          }
        })
      );
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Logout the user
   */
  logout(): Observable<any> {
    const sessionId = this.getSessionId();
    
    // If we have a session ID, call the logout endpoint
    if (sessionId) {
      return this.http.post(`${environment.apiUrl}/sessions/logout`, {})
        .pipe(
          tap(() => this.clearAuthData()),
          catchError(error => {
            // Even if the server request fails, clear local auth data
            this.clearAuthData();
            return of({ success: true, message: 'Logged out locally' });
          })
        );
    } else {
      // No session ID, just clear local data
      this.clearAuthData();
      return of({ success: true, message: 'Logged out locally' });
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    // Stop the token expiration timer
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.unsubscribe();
      this.tokenExpirationTimer = null;
    }
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SESSION_ID_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}