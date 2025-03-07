import { Observable, map } from "rxjs";
import { InsuranceClaim, Invoice, Payment } from "../billing.model";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Invoice endpoints
  getInvoices(params?: any): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}/invoice/get`, { params });
  }

  getInvoiceById(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/invoices/${id}`);
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.apiUrl}/invoice/add`, invoice);
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/invoices/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/invoices/${id}`);
  }

  // Payment endpoints
  getPayments(params?: any): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/payments`, { params });
  }

  createPayment(payment: any): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/payments`, payment);
  }

  // Insurance claim endpoints
  getInsuranceClaims(params?: any): Observable<ApiResponse<InsuranceClaim[]>> {
    return this.http.get<ApiResponse<InsuranceClaim[]>>(`${this.apiUrl}/insurance-claims`, { params });
  }

  createInsuranceClaim(claim: Omit<InsuranceClaim, 'id'>): Observable<ApiResponse<InsuranceClaim>> {
    return this.http.post<ApiResponse<InsuranceClaim>>(`${this.apiUrl}/insurance-claims`, claim);
  }

  updateInsuranceClaim(id: string, claim: Partial<InsuranceClaim>): Observable<ApiResponse<InsuranceClaim>> {
    return this.http.put<ApiResponse<InsuranceClaim>>(`${this.apiUrl}/insurance-claims/${id}`, claim);
  }

  // Dashboard statistics
  getBillingStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`);
  }

  getBillingTrends(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/trends`);
  }

  generateInvoiceNumber(): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/generate-invoice-number`)
      .pipe(
        map(response => {
          // Assuming the API returns { success: true, data: "INV-12345678" }
          if (response.success && response.data) {
            return response;
          } else {
            // Generate a fallback invoice number if API response is not structured as expected
            const timestamp = new Date().getTime();
            return {
              success: true,
              data: `INV-${timestamp}`
            };
          }
        })
      );
  }
}