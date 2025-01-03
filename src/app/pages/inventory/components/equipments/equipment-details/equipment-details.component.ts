// src/app/pages/inventory/components/equipments/equipment-details/equipment-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { InventoryService } from '../../../services/inventory.service';

type PrimeNGSeverity = 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';


@Component({
  selector: 'app-equipment-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    TableModule
  ],
  templateUrl: 'equipment-details.component.html'
})
export class EquipmentDetailsComponent implements OnInit {
  equipment: any;
  maintenanceHistory: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadEquipmentDetails();
  }

  private loadEquipmentDetails() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loading = true;
      this.inventoryService.getEquipmentById(id).subscribe({
        next: (data) => {
          this.equipment = data;
          this.loadMaintenanceHistory(id);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load equipment details'
          });
          this.loading = false;
        }
      });
    }
  }

  private loadMaintenanceHistory(equipmentId: string) {
    this.inventoryService.getMaintenanceHistory(equipmentId).subscribe({
      next: (data) => {
        this.maintenanceHistory = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load maintenance history'
        });
        this.loading = false;
      }
    });
  }

  getConditionSeverity(condition: string): TagSeverity {
    switch (condition) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warn';  // Changed from 'warning'
      case 'Poor':
        return 'danger';
      case 'Out of Service':
        return 'danger';
      default:
        return 'warn';  // Changed from 'warning'
    }
  }

  

  getMaintenanceClass(date: string): string {
    if (!date) return '';
    const dueDate = new Date(date);
    const today = new Date();
    const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'text-red-600 font-medium';
    if (daysDiff <= 7) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
  }

  getCalibrationClass(date: string): string {
    return this.getMaintenanceClass(date);
  }

  getWarrantyClass(date: string): string {
    if (!date) return 'text-gray-500';
    const expiryDate = new Date(date);
    const today = new Date();
    return expiryDate < today ? 'text-red-600 font-medium' : 'text-green-600 font-medium';
  }

  getMaintenanceTypeSeverity(type: string): TagSeverity {
    switch (type) {
      case 'Preventive':
        return 'info';
      case 'Corrective':
        return 'warn';  // Changed from 'warning'
      case 'Calibration':
        return 'success';
      case 'Emergency':
        return 'danger';
      default:
        return 'info';
    }
  }

  getMaintenanceStatusSeverity(status: string): TagSeverity {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warn';  // Changed from 'warning'
      case 'In Progress':
        return 'info';
      case 'Overdue':
        return 'danger';
      default:
        return 'info';
    }
  }
  scheduleMaintenance() {
    // Implement maintenance scheduling logic
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}