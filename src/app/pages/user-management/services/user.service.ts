import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: UserFilters): Observable<User[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  updateUserStatus(id: string, status: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { status });
  }

  getUserActivity(userId: string): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activity`);
  }


  importUsers(csvData: string): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, { data: csvData });
  }
}