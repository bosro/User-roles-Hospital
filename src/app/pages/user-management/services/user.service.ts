import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { UserActivity } from '../models/user.model';

interface UserFilters {
  search?: string;
  role?: string | null;
  department?: string | null;
  status?: string | null;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  onlineUsers: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: UserFilters): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/get`, { params });
  }

  getUser(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${id}`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<ApiResponse<UserStats>>(`${this.apiUrl}/stats`).pipe(
      map(response => response.data)
    );
  }

  updateUserStatus(id: string, available: boolean): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/users/${id}/status`, { available });
  }

  resetPassword(id: string, password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/users/${id}/reset-password`, { password });
  }

  getUserActivity(userId: string): Observable<UserActivity[]> {
    return this.http.get<ApiResponse<UserActivity[]>>(`${this.apiUrl}/users/${userId}/activity`).pipe(
      map(response => response.data)
    );
  }

  importUsers(csvData: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', csvData);
    
    return this.http.post<ApiResponse<ImportResult>>(`${this.apiUrl}/users/import`, formData).pipe(
      map(response => response.data)
    );
  }
}