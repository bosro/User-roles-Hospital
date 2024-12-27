import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: Date;
  status: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityServiceService {

  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getActivities(params?: any): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.apiUrl, { params });
  }

  logActivity(activity: Partial<Activity>): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, activity);
  }
}
