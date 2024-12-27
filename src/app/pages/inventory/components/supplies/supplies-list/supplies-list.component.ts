import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { Supply } from '../../../models/inventory.model';
import { InventoryService } from '../../../services/inventory.service';
import { ConfirmationService, MessageService } from 'primeng/api';

type SupplyStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
type TagSeverityType = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;
type ButtonSeverityType = 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
type SupplyCategory = 'disposable' | 'reusable' | 'sterile' | 'general';


@Component({
  selector: 'app-supplies-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TagModule,
    DialogModule
  ],
  templateUrl: 'supplies-list.component.html'
})
export class SuppliesListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  supplies: Supply[] = [];
  loading = false;
  showStockDialog = false;
  selectedSupply: Supply | null = null;

  private readonly severities: Record<SupplyStatus, TagSeverityType> = {
    'in-stock': 'success',
    'low-stock': 'warn',
    'out-of-stock': 'danger'
  };

  private readonly categoryClasses: Record<SupplyCategory, string> = {
    'disposable': 'bg-blue-100 text-blue-800',
    'reusable': 'bg-green-100 text-green-800',
    'sterile': 'bg-purple-100 text-purple-800',
    'general': 'bg-gray-100 text-gray-800'
  };


  constructor(
    private inventoryService: InventoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadSupplies();
  }

  loadSupplies() {
    this.loading = true;
    this.inventoryService.getSupplies().subscribe({
      next: (data) => {
        this.supplies = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load supplies'
        });
        this.loading = false;
      }
    });
  }

  getStockLevelClass(supply: Supply): string {
    if (supply.quantity <= supply.reorderLevel) {
      return 'text-red-500 font-medium';
    }
    if (supply.quantity <= supply.minStockLevel) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-green-500 font-medium';
  }

  onSearch(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element?.value !== undefined) {
      this.dt.filterGlobal(element.value, 'contains');
    }
  }

  getStatusSeverity(status: string): TagSeverityType {
    return this.severities[status as SupplyStatus] || 'info';
  }

  getCategoryClass(category: string): string {
    return this.categoryClasses[category as SupplyCategory] || this.categoryClasses['general'];
  }

  getLowStockCount(): number {
    return this.supplies.filter(s => s.quantity <= s.reorderLevel).length;
  }

  hasLowStockItems(): boolean {
    return this.getLowStockCount() > 0;
  }

  exportData() {
    // Implement export functionality
  }

  generateOrder() {
    // Implement order generation for low stock items
  }

  editSupply(supply: Supply) {
    this.router.navigate(['edit', supply.id], { relativeTo: this.route });
  }

  adjustStock(supply: Supply) {
    this.selectedSupply = supply;
    this.showStockDialog = true;
  }

  confirmDelete(supply: Supply) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${supply.name}?`,
      accept: () => {
        this.inventoryService.deleteSupply(supply.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Supply deleted successfully'
            });
            this.loadSupplies();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete supply'
            });
          }
        });
      }
    });
  }
}
