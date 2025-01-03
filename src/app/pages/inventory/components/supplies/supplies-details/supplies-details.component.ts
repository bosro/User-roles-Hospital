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

@Component({
  selector: 'app-supplies-details',
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
  templateUrl: 'supplies-details.component.html'
})
export class SuppliesDetailsComponent implements OnInit {
  supply: any;
  usageHistory: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadSupplyDetails();
  }

  private loadSupplyDetails() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loading = true;
      this.inventoryService.getSupplyById(id).subscribe({
        next: (data) => {
          this.supply = data;
          this.loadUsageHistory(id);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load supply details'
          });
          this.loading = false;
        }
      });
    }
  }

  private loadUsageHistory(supplyId: string) {
    this.inventoryService.getSupplyUsageHistory(supplyId).subscribe({
      next: (data) => {
        this.usageHistory = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load usage history'
        });
        this.loading = false;
      }
    });
  }

  getStockLevelClass(): string {
    if (!this.supply) return '';
    if (this.supply.quantity <= this.supply.minStockLevel) {
      return 'text-red-600 font-medium';
    }
    if (this.supply.quantity <= this.supply.reorderLevel) {
      return 'text-yellow-600 font-medium';
    }
    return 'text-green-600 font-medium';
  }

  getCategoryClass(category: string): string {
    const classes: Record<string, string> = {
      'Medical': 'bg-blue-100 text-blue-800',
      'Surgical': 'bg-green-100 text-green-800',
      'Laboratory': 'bg-purple-100 text-purple-800',
      'Office': 'bg-gray-100 text-gray-800',
      'Cleaning': 'bg-yellow-100 text-yellow-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  }

  getUsageTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (type) {
      case 'IN':
        return 'success';
      case 'OUT':
        return 'warn';  // Changed from 'warning'
      case 'ADJUSTMENT':
        return 'info';
      case 'LOSS':
        return 'danger';
      default:
        return 'info';
    }
  }

  isLowStock(): boolean {
    return this.supply?.quantity <= this.supply?.reorderLevel;
  }

  generateOrder() {
    // Implement order generation logic
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}