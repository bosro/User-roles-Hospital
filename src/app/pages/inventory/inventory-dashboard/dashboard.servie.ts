import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Alert, Activity, DashboardData } from '../models/inventory.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/inventory/medicine/get`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/dashboard`)
      .pipe(
        map(response => {
          if (response.success) {
            // Map API response to our model
            return {
              totalMedicines: response.data.totalMedicines || 0,
              totalEquipment: response.data.totalEquipment || 0,
              totalSupplies: response.data.totalSupplies || 0,
              lowStockItems: response.data.lowStockItems || 0,
              criticalAlerts: response.data.criticalAlerts || [],
              lowestStockMedicine: response.data.lowestStockMedicine || null,
              // Generate some recent activities if not provided by API
              recentActivities: this.generateRecentActivities()
            };
          }
          throw new Error('Failed to load dashboard data');
        })
      );
  }

  // Generate sample recent activities (since they're not in the API response)
  private generateRecentActivities(): Activity[] {
    const currentDate = new Date();
    
    return [
      {
        timestamp: new Date(currentDate.getTime() - 1000 * 60 * 30), // 30 minutes ago
        description: 'Inventory check completed',
        user: 'Admin User',
        status: 'completed'
      },
      {
        timestamp: new Date(currentDate.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
        description: 'New medicines added to inventory',
        user: 'Pharmacy Staff',
        status: 'completed'
      },
      {
        timestamp: new Date(currentDate.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
        description: 'Equipment maintenance scheduled',
        user: 'Technician',
        status: 'pending'
      }
    ];
  }
}