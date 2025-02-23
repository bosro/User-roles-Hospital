import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { User } from '../pages/user-management/models/user.model';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private refreshTokenTimeout: any;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getUserFromStorage()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          // Store user details and token
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.user.role)
          this.currentUserSubject.next(response.user);
          this.startRefreshTokenTimer();
          return response;
        })
      );
  }

  logout() {
    // Optional: Call backend to invalidate token
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.stopRefreshTokenTimer();
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, {})
      .pipe(
        map(response => {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          this.startRefreshTokenTimer();
          return response;
        })
      );
  }

  updateCurrentUser(user: User) {
    // Update stored user data
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token,
      newPassword
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verify-email`, { token });
  }

  private startRefreshTokenTimer() {
    // Parse token to get expiration time
    const token = localStorage.getItem('token');
    if (!token) return;

    const jwtToken = JSON.parse(atob(token.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry

    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe();
    }, timeout);
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const jwtToken = JSON.parse(atob(token.split('.')[1]));
      const expires = new Date(jwtToken.exp * 1000);
      return expires > new Date();
    } catch {
      return false;
    }
  }

  hasRole(role: string | string[]): boolean {
    const currentUser = this.currentUserValue;
    if (!currentUser) return false;

    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  }

  // Method to update user password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, {
      oldPassword,
      newPassword
    });
  }

  // Method to get user profile
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/profile`).pipe(
      map(user => {
        this.updateCurrentUser(user);
        return user;
      })
    );
  }


}