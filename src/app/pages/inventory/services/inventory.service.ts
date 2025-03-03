import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, Equipment, Supply, PurchaseOrder, ApiResponse } from '../models/inventory.model';

interface StockMovement {
  
  id: string;
  date: Date;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference: string;
  updatedBy: string;
}

interface MaintenanceRecord {
  _id: string;
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
 // Get all medicines
 getMedicines(): Observable<Medicine[]> {
  return this.http.get<ApiResponse<Medicine[]>>(`${this.apiUrl}/medicine/get`)
    .pipe(
      map(response => {
        if (response.success) {
          // Add a computed status property to each medicine
          return response.data.map(medicine => ({
            ...medicine,
            status: this.computeMedicineStatus(medicine)
          }));
        }
        return [];
      })
    );
}

// Get medicine by ID
getMedicineById(id: string): Observable<Medicine> {
  return this.http.get<ApiResponse<Medicine>>(`${this.apiUrl}/medicine/${id}`)
    .pipe(
      map(response => {
        if (response.success) {
          return {
            ...response.data,
            status: this.computeMedicineStatus(response.data)
          };
        }
        throw new Error('Medicine not found');
      })
    );
}

// Create new medicine
createMedicine(medicine: Omit<Medicine, '_id'>): Observable<Medicine> {
  return this.http.post<ApiResponse<Medicine>>(`${this.apiUrl}/medicine/create`, medicine)
    .pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to create medicine');
      })
    );
}

// Update medicine
updateMedicine(id: string, medicine: Partial<Medicine>): Observable<Medicine> {
  return this.http.put<ApiResponse<Medicine>>(`${this.apiUrl}/medicine/update/${id}`, medicine)
    .pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to update medicine');
      })
    );
}

// Delete medicine
deleteMedicine(id: string): Observable<boolean> {
  return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/medicine/delete/${id}`)
    .pipe(
      map(response => {
        return response.success;
      })
    );
}

// Get stock movements for a medicine
getMedicineStockMovements(medicineId: string): Observable<StockMovement[]> {
  return this.http.get<ApiResponse<StockMovement[]>>(`${this.apiUrl}/medicine/stock-movements/${medicineId}`)
    .pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        return [];
      })
    );
}

// Add stock movement
addStockMovement(movement: Omit<StockMovement, '_id'>): Observable<StockMovement> {
  return this.http.post<ApiResponse<StockMovement>>(`${this.apiUrl}/medicine/stock-movement`, movement)
    .pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to add stock movement');
      })
    );
}

// Compute medicine status based on quantity and expiry date
private computeMedicineStatus(medicine: Medicine): 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' {
  const expiryDate = new Date(medicine.expiryDate);
  const today = new Date();
  
  // Check if medicine is expired
  if (expiryDate < today) {
    return 'expired';
  }
  
  // Check stock levels
  if (medicine.quantity <= 0) {
    return 'out-of-stock';
  }
  
  if (medicine.quantity <= medicine.minStockLevel) {
    return 'low-stock';
  }
  
  return 'in-stock';
}


  // Equipment endpoints
  getEquipment(): Observable<Equipment[]> {
    return this.http.get<ApiResponse<Equipment[]>>(`${this.apiUrl}/equipment/get`)
      .pipe(
        map(response => {
          if (response.success) {
            // Map API fields to component fields and add status
            return response.data.map(equipment => this.mapEquipmentFields(equipment));
          }
          return [];
        })
      );
  }

  // Get equipment by ID
  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<ApiResponse<Equipment>>(`${this.apiUrl}/equipment/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return this.mapEquipmentFields(response.data);
          }
          throw new Error('Equipment not found');
        })
      );
  }

  // Create new equipment
  createEquipment(equipment: Omit<Equipment, '_id'>): Observable<Equipment> {
    // Map component fields to API fields
    const apiEquipment = {
      name: equipment.name,
      equipmentModel: equipment.model,
      serialNumber: equipment.serialNumber,
      manufacturer: equipment.manufacturer,
      condition: equipment.condition,
      nextMaintenanceDate: equipment.maintenanceDue,
      calibrationDueDate: equipment.calibrationDue,
      warrantyExpiry: equipment.warrantyExpiry,
      location: equipment.location,
      purchasePrice: equipment.price,
      notes: equipment.notes,
      image: equipment.image
    };

    return this.http.post<ApiResponse<Equipment>>(`${this.apiUrl}/equipment/add`, apiEquipment)
      .pipe(
        map(response => {
          if (response.success) {
            return this.mapEquipmentFields(response.data);
          }
          throw new Error('Failed to create equipment');
        })
      );
  }

  // Update equipment
  updateEquipment(id: string, equipment: Partial<Equipment>): Observable<Equipment> {
    // Map component fields to API fields
    const apiEquipment: any = {};
    if (equipment.name) apiEquipment.name = equipment.name;
    if (equipment.model) apiEquipment.equipmentModel = equipment.model;
    if (equipment.serialNumber) apiEquipment.serialNumber = equipment.serialNumber;
    if (equipment.manufacturer) apiEquipment.manufacturer = equipment.manufacturer;
    if (equipment.condition) apiEquipment.condition = equipment.condition;
    if (equipment.maintenanceDue) apiEquipment.nextMaintenanceDate = equipment.maintenanceDue;
    if (equipment.calibrationDue) apiEquipment.calibrationDueDate = equipment.calibrationDue;
    if (equipment.warrantyExpiry) apiEquipment.warrantyExpiry = equipment.warrantyExpiry;
    if (equipment.location) apiEquipment.location = equipment.location;
    if (equipment.price) apiEquipment.purchasePrice = equipment.price;
    if (equipment.notes) apiEquipment.notes = equipment.notes;
    if (equipment.image) apiEquipment.image = equipment.image;

    return this.http.put<ApiResponse<Equipment>>(`${this.apiUrl}/equipment/update/${id}`, apiEquipment)
      .pipe(
        map(response => {
          if (response.success) {
            return this.mapEquipmentFields(response.data);
          }
          throw new Error('Failed to update equipment');
        })
      );
  }

  // Delete equipment
  deleteEquipment(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/equipment/delete/${id}`)
      .pipe(
        map(response => {
          return response.success;
        })
      );
  }

  // Get maintenance history for equipment
  // getMaintenanceHistory(equipmentId: string): Observable<MaintenanceRecord[]> {
  //   return this.http.get<ApiResponse<MaintenanceRecord[]>>(`${this.apiUrl}/inventory/equipment/maintenance/${equipmentId}`)
  //     .pipe(
  //       map(response => {
  //         if (response.success) {
  //           return response.data;
  //         }
  //         return [];
  //       })
  //     );
  // }

  

  // Schedule maintenance for equipment
  scheduleMaintenance(maintenance: Omit<MaintenanceRecord, '_id'>): Observable<MaintenanceRecord> {
    return this.http.post<ApiResponse<MaintenanceRecord>>(`${this.apiUrl}/equipment/maintenance/add`, maintenance)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Failed to schedule maintenance');
        })
      );
  }

  // ---------- HELPER METHODS ----------

  // Map API equipment fields to component fields
  private mapEquipmentFields(equipment: any): Equipment {
    // Create a status property based on condition and maintenance dates
    const status = this.computeEquipmentStatus(equipment);

    return {
      ...equipment,
      model: equipment.equipmentModel || equipment.model,
      maintenanceDue: equipment.nextMaintenanceDate || equipment.maintenanceDue,
      calibrationDue: equipment.calibrationDueDate || equipment.calibrationDue,
      price: equipment.purchasePrice || equipment.price,
      status
    };
  }



  // Compute equipment status based on condition and maintenance dates
  private computeEquipmentStatus(equipment: Equipment): string {
    const maintenanceDate = new Date(equipment.nextMaintenanceDate || equipment.maintenanceDue || '');
    const today = new Date();
    
    // If maintenance is overdue, return 'maintenance-due'
    if (maintenanceDate < today) {
      return 'maintenance-due';
    }
    
    // Otherwise return the condition
    return equipment.condition.toLowerCase();
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

  // getMedicineStockMovements(medicineId: string): Observable<StockMovement[]> {
  //   return this.http.get<StockMovement[]>(
  //     `${this.apiUrl}/medicines/${medicineId}/stock-movements`
  //   );
  // }

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


