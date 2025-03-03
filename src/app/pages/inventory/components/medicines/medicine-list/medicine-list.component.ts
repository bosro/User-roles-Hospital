import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { Medicine } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';
import { StockAdjustmentComponent } from '../Stock-adjustment';

type MedicineStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
type TagSeverityType = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-medicines-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    InputTextModule,
    TagModule,
    DialogModule,
    StockAdjustmentComponent
  ],
  providers: [MessageService],
  templateUrl: 'medicine-list.component.html'
})
export class MedicinesListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  medicines: Medicine[] = [];
  loading = false;
  showStockDialog = false;
  selectedMedicine: Medicine | null = null;

  private readonly severities: Record<MedicineStatus, TagSeverityType> = {
    'in-stock': 'success',
    'low-stock': 'warn',
    'out-of-stock': 'danger',
    'expired': 'danger'
  };

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading = true;
    this.inventoryService.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load medicines'
        });
        this.loading = false;
      }
    });
  }

  onSearch(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element?.value !== undefined) {
      this.dt.filterGlobal(element.value, 'contains');
    }
  }

  getStockLevelClass(medicine: Medicine): string {
    if (medicine.quantity <= medicine.minStockLevel) {
      return 'text-red-500 font-medium';
    }
    if (medicine.quantity <= medicine.reorderLevel) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-green-500 font-medium';
  }

  getStatusSeverity(status: string): TagSeverityType {
    return this.severities[status as MedicineStatus] || 'info';
  }

  getExpiryClass(expiryDate: Date | string): string {
    const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) {
      return 'text-red-500 font-medium';
    }
    if (daysToExpiry < 30) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-gray-600';
  }

  viewDetails(medicine: Medicine) {
    this.router.navigate(['/inventory/medicines/view', medicine._id]);
  }

  editMedicine(medicine: Medicine) {
    this.router.navigate(['/inventory/medicines/edit', medicine._id]);
  }

  adjustStock(medicine: Medicine) {
    this.selectedMedicine = medicine;
    this.showStockDialog = true;
  }
  
  onStockUpdated() {
    this.loadMedicines();
  }
}