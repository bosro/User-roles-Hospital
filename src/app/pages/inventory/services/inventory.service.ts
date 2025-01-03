import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, Equipment, Supply, PurchaseOrder } from '../models/inventory.model';

interface StockMovement {
  id: string;
  date: Date;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference: string;
  updatedBy: string;
}

interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'Preventive' | 'Corrective' | 'Calibration' | 'Emergency';
  performedBy: string;
  status: 'Completed' | 'Pending' | 'In Progress' | 'Overdue';
  notes: string;
}

interface UsageRecord {
  id: string;
  date: Date;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'LOSS';
  quantity: number;
  department: string;
  reference: string;
  updatedBy: string;
}

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

  getMedicineStockMovements(medicineId: string): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(
      `${this.apiUrl}/medicines/${medicineId}/stock-movements`
    );
  }

  // Equipment maintenance history
  getMaintenanceHistory(equipmentId: string): Observable<MaintenanceRecord[]> {
    return this.http.get<MaintenanceRecord[]>(
      `${this.apiUrl}/equipment/${equipmentId}/maintenance-history`
    );
  }

  scheduleEquipmentMaintenance(
    equipmentId: string,
    maintenance: {
      type: 'Preventive' | 'Corrective' | 'Calibration' | 'Emergency';
      scheduledDate: Date;
      notes?: string;
    }
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/equipment/${equipmentId}/schedule-maintenance`,
      maintenance
    );
  }

  updateMaintenanceStatus(
    equipmentId: string,
    maintenanceId: string,
    status: 'Completed' | 'Pending' | 'In Progress' | 'Overdue',
    notes?: string
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/equipment/${equipmentId}/maintenance/${maintenanceId}`,
      { status, notes }
    );
  }

  // Supply usage history
  getSupplyUsageHistory(supplyId: string): Observable<UsageRecord[]> {
    return this.http.get<UsageRecord[]>(
      `${this.apiUrl}/supplies/${supplyId}/usage-history`
    );
  }

  recordSupplyUsage(
    supplyId: string,
    usage: {
      type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'LOSS';
      quantity: number;
      department: string;
      reference?: string;
      notes?: string;
    }
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/supplies/${supplyId}/record-usage`,
      usage
    );
  }

  // Helper function to handle query params
  private createQueryParams(params: Record<string, any>): {
    [key: string]: string;
  } {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value.toString(),
        }),
        {}
      );
  }

  // General inventory reports
  generateInventoryReport(params: {
    startDate: Date;
    endDate: Date;
    type?: 'medicine' | 'equipment' | 'supply';
    category?: string;
  }): Observable<any> {
    const queryParams = this.createQueryParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      type: params.type,
      category: params.category,
    });

    return this.http.get(`${this.apiUrl}/reports/inventory`, {
      params: queryParams,
    });
  }

  generateStockMovementReport(params: {
    startDate: Date;
    endDate: Date;
    type?: 'medicine' | 'equipment' | 'supply';
    movementType?: 'IN' | 'OUT' | 'ADJUSTMENT';
  }): Observable<any> {
    const queryParams = this.createQueryParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      type: params.type,
      movementType: params.movementType,
    });

    return this.http.get(`${this.apiUrl}/reports/stock-movements`, {
      params: queryParams,
    });
  }

  generateMaintenanceReport(params: {
    startDate: Date;
    endDate: Date;
    status?: 'Completed' | 'Pending' | 'In Progress' | 'Overdue';
    type?: 'Preventive' | 'Corrective' | 'Calibration' | 'Emergency';
  }): Observable<any> {
    const queryParams = this.createQueryParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      status: params.status,
      type: params.type,
    });

    return this.http.get(`${this.apiUrl}/reports/maintenance`, {
      params: queryParams,
    });
  }

  createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'orderNumber'>): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/purchase-orders`, order);
  }

  updatePurchaseOrder(id: string, order: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}`, order);
  }

  getPurchaseOrders(params?: {
    status?: PurchaseOrder['status'];
    itemType?: PurchaseOrder['itemType'];
  }): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchase-orders`, { params });
  }
}
