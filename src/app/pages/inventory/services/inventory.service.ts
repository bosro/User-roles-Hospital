import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, Equipment, Supply } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  // Medicine endpoints
  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.apiUrl}/medicines`);
  }

  getMedicineById(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/medicines/${id}`);
  }

  createMedicine(medicine: Omit<Medicine, 'id'>): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.apiUrl}/medicines`, medicine);
  }

  updateMedicine(
    id: string,
    medicine: Partial<Medicine>
  ): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/medicines/${id}`, medicine);
  }

  deleteMedicine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/medicines/${id}`);
  }

  // Equipment endpoints
  getEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipment`);
  }

  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/equipment/${id}`);
  }

  createEquipment(equipment: Omit<Equipment, 'id'>): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/equipment`, equipment);
  }

  updateEquipment(
    id: string,
    equipment: Partial<Equipment>
  ): Observable<Equipment> {
    return this.http.put<Equipment>(
      `${this.apiUrl}/equipment/${id}`,
      equipment
    );
  }

  deleteEquipment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/equipment/${id}`);
  }

  // Supply endpoints
  getSupplies(): Observable<Supply[]> {
    return this.http.get<Supply[]>(`${this.apiUrl}/supplies`);
  }

  getSupplyById(id: string): Observable<Supply> {
    return this.http.get<Supply>(`${this.apiUrl}/supplies/${id}`);
  }

  createSupply(supply: Omit<Supply, 'id'>): Observable<Supply> {
    return this.http.post<Supply>(`${this.apiUrl}/supplies`, supply);
  }

  updateSupply(id: string, supply: Partial<Supply>): Observable<Supply> {
    return this.http.put<Supply>(`${this.apiUrl}/supplies/${id}`, supply);
  }

  deleteSupply(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/supplies/${id}`);
  }

  // Stock management
  adjustStock(
    itemId: string,
    type: 'medicine' | 'equipment' | 'supply',
    adjustment: {
      quantity: number;
      type: 'add' | 'remove';
      reason: string;
      notes?: string;
    }
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${type}/${itemId}/adjust-stock`,
      adjustment
    );
  }

  // Stock alerts
  getLowStockItems(): Observable<(Medicine | Equipment | Supply)[]> {
    return this.http.get<(Medicine | Equipment | Supply)[]>(
      `${this.apiUrl}/low-stock`
    );
  }

  getExpiringItems(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.apiUrl}/medicines/expiring`);
  }
}
