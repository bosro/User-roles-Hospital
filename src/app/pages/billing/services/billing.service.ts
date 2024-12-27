import { Observable } from "rxjs";
import { InsuranceClaim, Invoice, Payment } from "../billing.model";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

  @Injectable({
    providedIn: 'root'
  })
  export class BillingService {
    private apiUrl = `${environment.apiUrl}/billing`;
  
    constructor(private http: HttpClient) {}
  
    // Invoice endpoints
    getInvoices(params?: any): Observable<Invoice[]> {
      return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`, { params });
    }
  
    getInvoiceById(id: string): Observable<Invoice> {
      return this.http.get<Invoice>(`${this.apiUrl}/invoices/${id}`);
    }
  
    createInvoice(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
      return this.http.post<Invoice>(`${this.apiUrl}/invoices`, invoice);
    }
  
    updateInvoice(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
      return this.http.put<Invoice>(`${this.apiUrl}/invoices/${id}`, invoice);
    }
  
    deleteInvoice(id: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/invoices/${id}`);
    }
  
    // Payment endpoints
    getPayments(params?: any): Observable<Payment[]> {
      return this.http.get<Payment[]>(`${this.apiUrl}/payments`, { params });
    }
  
    createPayment(payment: Omit<Payment, 'id'>): Observable<Payment> {
      return this.http.post<Payment>(`${this.apiUrl}/payments`, payment);
    }
  
    // Insurance claim endpoints
    getInsuranceClaims(params?: any): Observable<InsuranceClaim[]> {
      return this.http.get<InsuranceClaim[]>(`${this.apiUrl}/insurance-claims`, { params });
    }
  
    createInsuranceClaim(claim: Omit<InsuranceClaim, 'id'>): Observable<InsuranceClaim> {
      return this.http.post<InsuranceClaim>(`${this.apiUrl}/insurance-claims`, claim);
    }
  
    updateInsuranceClaim(id: string, claim: Partial<InsuranceClaim>): Observable<InsuranceClaim> {
      return this.http.put<InsuranceClaim>(`${this.apiUrl}/insurance-claims/${id}`, claim);
    }
  
    // Dashboard statistics
    getBillingStats(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/stats`);
    }
  
    getBillingTrends(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/trends`);
    }
  
    generateInvoiceNumber(): Observable<string> {
      return this.http.get<string>(`${this.apiUrl}/generate-invoice-number`);
    }
  }