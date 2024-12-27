type ConditionType = 'new' | 'good' | 'fair' | 'poor';
type TagSeverityType = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Equipment } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TagModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: 'equipment-list.component.html'
})
export class EquipmentListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  equipment: Equipment[] = [];
  loading = false;
  showMaintenanceDialog = false;
  selectedEquipment: Equipment | null = null;

  private readonly severities: Record<ConditionType, TagSeverityType> = {
    'new': 'success',
    'good': 'info',
    'fair': 'warn',
    'poor': 'danger'
  };

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadEquipment();
  }

  loadEquipment() {
    this.loading = true;
    this.inventoryService.getEquipment().subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading equipment:', error);
        this.loading = false;
      }
    });
  }

  getConditionSeverity(condition: string): TagSeverityType {
    return this.severities[condition as ConditionType] || 'info';
  }

  getMaintenanceClass(date: string | Date): string {
    const daysToMaintenance = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysToMaintenance < 0) {
      return 'text-red-500 font-medium';
    }
    if (daysToMaintenance < 30) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-gray-600';
  }

  onSearch(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element?.value !== undefined) {
      this.dt.filterGlobal(element.value, 'contains');
    }
  }

  viewDetails(equipment: Equipment) {
    // Navigate to details view
  }

  editEquipment(equipment: Equipment) {
    // Navigate to edit form
  }

  scheduleMaintenance(equipment: Equipment) {
    this.selectedEquipment = equipment;
    this.showMaintenanceDialog = true;
  }
}