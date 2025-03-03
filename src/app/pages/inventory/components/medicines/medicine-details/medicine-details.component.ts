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
import { Medicine, StockMovement } from '../../../models/inventory.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-medicine-details',
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
  providers: [MessageService],
  templateUrl: 'medicine-details.component.html'
})
export class MedicineDetailsComponent implements OnInit {
  medicine: Medicine | null = null;
  stockMovements: StockMovement[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadMedicineDetails();
  }

  private loadMedicineDetails() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loading = true;
      this.inventoryService.getMedicineById(id).subscribe({
        next: (data) => {
          this.medicine = data;
          this.loadStockMovements(id);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load medicine details'
          });
          this.loading = false;
        }
      });
    }
  }

  private loadStockMovements(medicineId: string) {
    this.inventoryService.getMedicineStockMovements(medicineId).subscribe({
      next: (data) => {
        // this.stockMovements = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load stock movements'
        });
        this.loading = false;
      }
    });
  }

  getStockLevelClass(): string {
    if (!this.medicine) return '';
    if (this.medicine.quantity <= this.medicine.minStockLevel) {
      return 'text-red-600 font-medium';
    }
    if (this.medicine.quantity <= this.medicine.reorderLevel) {
      return 'text-yellow-600 font-medium';
    }
    return 'text-green-600 font-medium';
  }

  getExpiryClass(date: string): string {
    if (!date) return '';
    const expiryDate = new Date(date);
    const today = new Date();
    const monthDiff = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthDiff <= 0) return 'text-red-600 font-medium';
    if (monthDiff <= 3) return 'text-yellow-600 font-medium';
    return 'text-gray-900 font-medium';
  }

  getMovementSeverity(type: string): TagSeverity {
    switch (type) {
      case 'IN':
        return 'success';
      case 'OUT':
        return 'danger';
      default:
        return 'info';
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}