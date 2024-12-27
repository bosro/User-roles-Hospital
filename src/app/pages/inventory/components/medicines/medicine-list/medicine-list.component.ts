import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Medicine } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';
import { Dialog } from 'primeng/dialog';

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
    Dialog
  ],
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

  constructor(private inventoryService: InventoryService) {}

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
    if (medicine.quantity <= medicine.reorderLevel) {
      return 'text-red-500 font-medium';
    }
    if (medicine.quantity <= medicine.minStockLevel) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-green-500 font-medium';
  }

  getStatusSeverity(status: string): TagSeverityType {
    return this.severities[status as MedicineStatus] || 'info';
  }

  getExpiryClass(expiryDate: Date): string {
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
    // Navigate to details view
  }

  editMedicine(medicine: Medicine) {
    // Navigate to edit form
  }

  adjustStock(medicine: Medicine) {
    this.selectedMedicine = medicine;
    this.showStockDialog = true;
  }
}