import { Observable } from 'rxjs';
import {
  ExportReportData,
  FinancialMetrics,
  PatientMetrics,
  ReportFilters,
  ShareReportData,
} from '../models/reports.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { ReportTemplate } from '../models/report-template.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getFinancialMetrics(filters: ReportFilters): Observable<FinancialMetrics> {
    return this.http.get<FinancialMetrics>(`${this.apiUrl}/financial`, {
      params: this.getParams(filters),
    });
  }

  getPatientMetrics(filters: ReportFilters): Observable<PatientMetrics> {
    return this.http.get<PatientMetrics>(`${this.apiUrl}/patient`, {
      params: this.getParams(filters),
    });
  }

  getDepartmentMetrics(filters: ReportFilters): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/department`, {
      params: this.getParams(filters),
    });
  }

  getInventoryMetrics(filters: ReportFilters): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory`, {
      params: this.getParams(filters),
    });
  }

  exportReport(reportId: string, data: ExportReportData): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/${reportId}`, data, {
      responseType: 'blob'
    });
  }

  getTemplate(id: string): Observable<ReportTemplate> {
    return this.http.get<ReportTemplate>(`${this.apiUrl}/templates/${id}`);
  }

  createTemplate(template: ReportTemplate): Observable<ReportTemplate> {
    return this.http.post<ReportTemplate>(`${this.apiUrl}/templates`, template);
  }

  updateTemplate(
    id: string,
    template: ReportTemplate
  ): Observable<ReportTemplate> {
    return this.http.put<ReportTemplate>(
      `${this.apiUrl}/templates/${id}`,
      template
    );
  }

  preview(template: ReportTemplate): Observable<any> {
    return this.http.post(`${this.apiUrl}/templates/preview`, template);
  }

  private getParams(filters: ReportFilters): HttpParams {
    let params = new HttpParams()
      .set('startDate', filters.dateRange.start.toISOString())
      .set('endDate', filters.dateRange.end.toISOString());

    if (filters.department)
      params = params.set('department', filters.department);
    if (filters.doctor) params = params.set('doctor', filters.doctor);
    if (filters.reportType)
      params = params.set('reportType', filters.reportType);
    if (filters.groupBy) params = params.set('groupBy', filters.groupBy);

    return params;
  }

  getReportTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.apiUrl}/templates`);
  }

  deleteReportTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
  }

  shareReport(data: ShareReportData): Observable<any> {
    return this.http.post(`${this.apiUrl}/share`, data);
  }


}
