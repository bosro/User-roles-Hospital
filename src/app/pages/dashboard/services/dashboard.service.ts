import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  appointmentsToday: number;
  pendingBills: number;
  occupiedBeds: number;
  totalBeds: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface ChartData {
  patientData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      fill: boolean;
      borderColor: string;
      tension: number;
    }>;
  };
  revenueData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
    }>;
  };
}

export interface DashboardAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getRecentAppointments(): Observable<DashboardAppointment[]> {
    return this.http.get<DashboardAppointment[]>(`${this.apiUrl}/dashboard/appointments/recent`);
  }

  getChartData(timeRange: string, department?: string): Observable<ChartData> {
    let params = new HttpParams().set('timeRange', timeRange);
    if (department) {
      params = params.set('department', department);
    }
    return this.http.get<ChartData>(`${this.apiUrl}/dashboard/chart-data`, { params });
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  exportDashboardPDF(timeRange: string): Observable<Blob> {
    const params = new HttpParams().set('timeRange', timeRange);
    return this.http.get(`${this.apiUrl}/dashboard/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportDashboardExcel(timeRange: string): Observable<Blob> {
    const params = new HttpParams().set('timeRange', timeRange);
    return this.http.get(`${this.apiUrl}/dashboard/export/excel`, {
      params,
      responseType: 'blob'
    });
  }
}