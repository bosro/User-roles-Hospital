import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class ProfileService {
    private apiUrl = `${environment.apiUrl}/profile`;

    constructor(private http: HttpClient) {}

    getUserProfile(): Observable<any> {
      return this.http.get(this.apiUrl);
    }

    updateProfile(data: any): Observable<any> {
      return this.http.put(this.apiUrl, data);
    }

    updatePassword(data: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/password`, data);
    }

    updatePhoto(photo: File): Observable<any> {
      const formData = new FormData();
      formData.append('photo', photo);
      return this.http.put(`${this.apiUrl}/photo`, formData);
    }

    updatePreferences(preferences: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/preferences`, preferences);
    }

    getLoginHistory(): Observable<any> {
      return this.http.get(`${this.apiUrl}/login-history`);
    }

    setupTwoFactor(): Observable<any> {
      return this.http.post(`${this.apiUrl}/2fa/setup`, {});
    }

    disableTwoFactor(): Observable<any> {
      return this.http.delete(`${this.apiUrl}/2fa`);
    }

    verifyTwoFactor(code: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/2fa/verify`, { code });
    }
  }
