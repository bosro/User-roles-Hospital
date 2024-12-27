import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class SettingsService {
    private apiUrl = `${environment.apiUrl}/settings`;
  
    constructor(private http: HttpClient) {}
  
    getGeneralSettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/general`);
    }
  
    updateGeneralSettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/general`, settings);
    }
  
    getHospitalSettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/hospital`);
    }

    sendTestInvoiceEmail(): Observable<any> {
      return this.http.post(`${this.apiUrl}/billing/send-test-email`, {});
    }
  
  
    updateHospitalSettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/hospital`, settings);
    }
  
    getDepartmentSettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/departments`);
    }
  
    updateDepartmentSettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/departments`, settings);
    }
  
    getBillingSettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/billing`);
    }
  
    updateBillingSettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/billing`, settings);
    }
  
    getNotificationSettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/notifications`);
    }
  
    updateNotificationSettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/notifications`, settings);
    }
  
    getSecuritySettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/security`);
    }
  
    updateSecuritySettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/security`, settings);
    }
  
    getIntegrationSettings(): Observable<any> {
      return this.http.get(`${this.apiUrl}/integrations`);
    }
  
    updateIntegrationSettings(settings: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/integrations`, settings);
    }

    testEmailSettings(settings: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/notifications/test-email`, settings);
  }

  testSMSSettings(settings: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/notifications/test-sms`, settings);
  }

  testIntegrationConnection(type: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/integrations/test-connection/${type}`, {});
  }

  getDepartments(): Observable<any> {
      return this.http.get(`${this.apiUrl}/departments`);
  }

  addDepartment(department: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/departments`, department);
  }

  updateDepartment(department: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/departments/${department.id}`, department);
  }

  deleteDepartment(id: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/departments/${id}`);
  }

  resetSecuritySettings(): Observable<any> {
      return this.http.post(`${this.apiUrl}/security/reset`, {});
  }
  }