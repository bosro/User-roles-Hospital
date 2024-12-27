import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission,UserPermission } from '../models/permission.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  getUserPermissions(userId: string): Observable<UserPermission[]> {
    return this.http.get<UserPermission[]>(`${this.apiUrl}/users/${userId}`);
  }

  updateUserPermissions(userId: string, permissions: UserPermission[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}`, permissions);
  }
}