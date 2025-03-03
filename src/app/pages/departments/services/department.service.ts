// src/app/pages/departments/services/department.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Department } from '../department.model';




@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:5000/api/v1/department';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<any>(`${this.apiUrl}/get`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      })
    );
  }

  getDepartmentById(id: string): Observable<Department> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Department not found');
      })
    );
  }

  createDepartment(department: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, department);
  }

  updateDepartment(id: string, department: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/edit/${id}`, department);
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }
}