import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabReport, LabResult, LabResultsParams } from '../models/lab-result.model';

@Injectable({
  providedIn: 'root'
})
export class LabResultsService {
  private apiUrl = `${environment.apiUrl}/lab-results`;

  constructor(private http: HttpClient) {}

  getPatientLabResults(patientId: string, params?: LabResultsParams): Observable<LabReport[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.http.get<LabReport[]>(`${this.apiUrl}/patients/${patientId}`, { params: httpParams });
  }

  getLabReport(reportId: string): Observable<LabReport> {
    return this.http.get<LabReport>(`${this.apiUrl}/${reportId}`);
  }

  createLabReport(report: Omit<LabReport, 'id'>): Observable<LabReport> {
    return this.http.post<LabReport>(this.apiUrl, report);
  }

  updateLabReport(reportId: string, report: Partial<LabReport>): Observable<LabReport> {
    return this.http.put<LabReport>(`${this.apiUrl}/${reportId}`, report);
  }

  deleteLabReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`);
  }

  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download`, {
      responseType: 'blob'
    });
  }

  getTrendAnalysis(patientId: string, testName: string, timeRange?: string): Observable<LabResult[]> {
    let params = new HttpParams();
    if (timeRange) {
      params = params.set('timeRange', timeRange);
    }

    return this.http.get<LabResult[]>(
      `${this.apiUrl}/patients/${patientId}/trend/${testName}`,
      { params }
    );
  }

  addTestResult(reportId: string, test: Omit<LabResult, 'id'>): Observable<LabResult> {
    return this.http.post<LabResult>(`${this.apiUrl}/${reportId}/tests`, test);
  }

  updateTestResult(reportId: string, testId: string, test: Partial<LabResult>): Observable<LabResult> {
    return this.http.put<LabResult>(`${this.apiUrl}/${reportId}/tests/${testId}`, test);
  }

  deleteTestResult(reportId: string, testId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}/tests/${testId}`);
  }
}