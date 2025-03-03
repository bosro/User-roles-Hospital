import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Equipment } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';
import { MaintenanceFormComponent } from '../Maintenanceform';

type ConditionType = 'new' | 'good' | 'fair' | 'poor';
type TagSeverityType = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

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
    InputTextModule,
    MaintenanceFormComponent
  ],
  providers: [MessageService],
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

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private messageService: MessageService
  ) {}

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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load equipment'
        });
        this.loading = false;
      }
    });
  }

  getConditionSeverity(condition: string): TagSeverityType {
    // Normalize condition to lowercase to match keys in severities object
    const normalizedCondition = condition?.toLowerCase() as ConditionType;
    return this.severities[normalizedCondition] || 'info';
  }

  getMaintenanceClass(date: string | Date): string {
    if (!date) return 'text-gray-500';
    
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
    this.router.navigate(['/inventory/equipment/view', equipment._id]);
  }

  editEquipment(equipment: Equipment) {
    this.router.navigate(['/inventory/equipment/edit', equipment._id]);
  }

  scheduleMaintenance(equipment: Equipment) {
    this.selectedEquipment = equipment;
    this.showMaintenanceDialog = true;
  }
  
  onMaintenanceScheduled() {
    this.loadEquipment();
  }
}