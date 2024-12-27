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
  
  export interface Medicine extends InventoryItem {
    dosageForm: string;
    strength: string;
    manufacturer: string;
    batchNumber: string;
    storageConditions: string;
    prescriptionRequired: boolean;
  }
  
  export interface Equipment extends InventoryItem {
    model: string;
    serialNumber: string;
    manufacturer: string;
    maintenanceDue?: Date;
    calibrationDue?: Date;
    warrantyExpiry?: Date;
    condition: 'new' | 'good' | 'fair' | 'poor';
  }
  
  export interface Supply extends InventoryItem {
    brand: string;
    size?: string;
    material?: string;
    sterile?: boolean;
    disposable: boolean;
  }