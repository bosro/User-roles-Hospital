import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission,UserPermission } from '../models/permission.model';
import { environment } from '../../../environments/environment';


export interface SessionResponse {
  success: boolean;
  count: number;
  sessions: SessionData[];
}

export interface SessionData {
  _id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActivity: string;
  userId:{
    firstName: string;
    lastName:string;
  };
  duration: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}


@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}`;

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

  getActiveSessions(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.apiUrl}/sessions/active`);
  }

  terminateSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/session/${sessionId}`);
  }

  terminateAllSessions(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/all`);
  }
}