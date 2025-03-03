export interface InventoryItem {
    id?: string;
    name: string;
    code: string;
    category: 'medicine' | 'equipment' | 'supply';
    quantity: number;
    unit: string;
    minStockLevel: number;
    maxStockLevel: number;
    reorderLevel: number;
    location: string;
    supplier: string;
    price: number;
    expiryDate?: Date;
    lastRestocked?: Date;
    notes?: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  }

  export interface Activity {
    timestamp: Date;
    description: string;
    user: string;
    status: ActivityStatus;
  }


  export interface DashboardData {
    totalMedicines: number;
    totalEquipment: number;
    totalSupplies: number;
    lowStockItems: number;
    criticalAlerts: Alert[];
    lowestStockMedicine: any;
    recentActivities: Activity[];
  }
  
  
  export interface MaintenanceRecord {
    _id?: string;
    equipmentId: string;
    date: Date;
    type: 'Preventive' | 'Corrective' | 'Calibration' | 'Emergency';
    performedBy: string;
    status: 'Completed' | 'Pending' | 'In Progress' | 'Overdue';
    notes?: string;
    cost?: number;
  }


  export type AlertType = 'expiry' | 'stock' | 'maintenance';
export type ActivityStatus = 'completed' | 'pending' | 'failed';

export interface Alert {
  type: AlertType;
  title: string;
  message: string;
}
  
  export interface Equipment {
    _id?: string;
    id?: string;
    name: string;
    model?: string;
    equipmentModel?: string; // API field
    serialNumber: string;
    manufacturer: string;
    condition: string;
    maintenanceDue?: Date | string;
    nextMaintenanceDate?: Date | string; // API field
    calibrationDue?: Date | string;
    calibrationDueDate?: Date | string; // API field
    warrantyExpiry?: Date | string;
    location: string;
    price?: number;
    purchasePrice?: number; // API field
    notes?: string;
    image?: string;
    status?: string;
  }
  
  export interface Supply extends InventoryItem {
    brand: string;
    size?: string;
    material?: string;
    sterile?: boolean;
    disposable: boolean;
  }

  export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    itemId: string;
    itemType: 'medicine' | 'equipment' | 'supply';
    itemName: string;
    quantity: number;
    unit: string;
    status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
    urgency: 'normal' | 'urgent' | 'critical';
    requestedBy: string;
    requestDate: Date;
    approvedBy?: string;
    approvalDate?: Date;
    expectedDelivery?: Date;
    supplier?: string;
    notes?: string;
    totalCost?: number;
    requestedDate: Date;
  }

  export interface Medicine {
    _id?: string;
    id?: string;
    name: string;
    code: string;
    manufacturer: string;
    dosageForm: string;
    strength: string;
    quantity: number;
    unit: string;
    batchNumber: string;
    expiryDate: Date | string;
    price: number;
    minStockLevel: number;
    reorderLevel: number;
    storageConditions?: string;
    notes?: string;
    prescriptionRequired: boolean;
    status?: string;
  }
  
  export interface StockMovement {
    _id: string;
    medicineId: string;
    type: string;
    quantity: number;
    reference: string;
    date: Date;
    updatedBy: string;
  }
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
  }


