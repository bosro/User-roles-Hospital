import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReorderDialogComponent } from './reorder-dialog/reorder-dialog.component';
import { Alert, Activity, PurchaseOrder } from '../models/inventory.model';
import { DashboardService } from '../inventory-dashboard/dashboard.servie';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

type AlertType = 'expiry' | 'stock' | 'maintenance';
type ButtonSeverity = 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TableModule,
    TagModule,
    DialogModule,
    // DynamicDialogModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [DialogService, MessageService],
  templateUrl: 'inventory-dashboard.component.html'
})
export class InventoryDashboardComponent implements OnInit {
  
  // Quick stats
  totalMedicines = 0;
  totalEquipment = 0;
  totalSupplies = 0;
  lowStockItems = 0;

  // Chart data
  stockChartData: any;
  chartOptions: any;

  // Alerts and activities
  criticalAlerts: Alert[] = [];
  recentActivities: Activity[] = [];
  lowStockItemsList: any[] = [];

  // Loading state
  loading = true;

  constructor(
    private dashboardService: DashboardService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.initializeChartData();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private initializeChartData() {
    // Initialize with placeholder data, will be updated when real data loads
    this.stockChartData = {
      labels: ['Medicines', 'Equipment', 'Supplies'],
      datasets: [
        {
          label: 'Current Stock',
          data: [0, 0, 0],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
        },
        {
          label: 'Reorder Level',
          data: [0, 0, 0],
          backgroundColor: ['#90CAF9', '#A5D6A7', '#FFB74D']
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  private loadDashboardData() {
    this.loading = true;
    
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        // Update quick stats
        this.totalMedicines = data.totalMedicines;
        this.totalEquipment = data.totalEquipment;
        this.totalSupplies = data.totalSupplies || 0; // Default to 0 if not provided
        this.lowStockItems = data.lowStockItems;
        
        // Update alerts
        this.criticalAlerts = data.criticalAlerts;
        
        // Update recent activities
        this.recentActivities = data.recentActivities;
        
        // Update low stock items list
        if (data.lowestStockMedicine) {
          this.lowStockItemsList = [data.lowestStockMedicine];
        }
        
        // Update chart data
        this.updateChartData(data);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load dashboard data'
        });
        this.loading = false;
      }
    });
  }

  private updateChartData(data: any) {
    // Create more realistic chart data based on API response
    this.stockChartData = {
      labels: ['Medicines', 'Equipment', 'Supplies'],
      datasets: [
        {
          label: 'Current Items',
          data: [
            data.totalMedicines || 0, 
            data.totalEquipment || 0, 
            data.totalSupplies || 0
          ],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
        },
        {
          label: 'Critical Items',
          data: [
            this.countAlertsByType('expiry') + this.countAlertsByType('stock'),
            0, // No equipment alerts in sample data
            0  // No supplies alerts in sample data
          ],
          backgroundColor: ['#90CAF9', '#A5D6A7', '#FFB74D']
        }
      ]
    };
  }

  private countAlertsByType(type: string): number {
    return this.criticalAlerts.filter(alert => alert.type === type).length;
  }

  getAlertClass(type: AlertType): string {
    const classes: Record<AlertType, string> = {
      'expiry': 'bg-red-50',
      'stock': 'bg-yellow-50',
      'maintenance': 'bg-blue-50'
    };
    return classes[type] || 'bg-gray-50';
  }

  getAlertIcon(type: AlertType): string {
    const icons: Record<AlertType, string> = {
      'expiry': 'ri-timer-flash-line text-red-500',
      'stock': 'ri-stock-line text-yellow-500',
      'maintenance': 'ri-tools-line text-blue-500'
    };
    return icons[type] || 'ri-information-line text-gray-500';
  }

  getAlertSeverity(type: Alert['type']): ButtonSeverity {
    const severities: Record<Alert['type'], ButtonSeverity> = {
      'expiry': 'danger',
      'stock': 'warn',
      'maintenance': 'info'
    };
    return severities[type];
  }

  getActivitySeverity(status: Activity['status']): TagSeverity {
    const severities: Record<Activity['status'], TagSeverity> = {
      'completed': 'success',
      'pending': 'warn',
      'failed': 'danger'
    };
    return severities[status];
  }

  getStockLevelClass(item: any): string {
    const reorderLevel = item.reorderLevel || 50; // Default if not provided
    
    if (item.quantity <= reorderLevel * 0.5) {
      return 'text-red-500 font-medium';
    }
    if (item.quantity <= reorderLevel) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-green-500 font-medium';
  }

  handleAlert(alert: any) {
    // Handle alert action based on type
    switch (alert.type) {
      case 'expiry':
        this.router.navigate(['/inventory/medicines'], { queryParams: { filter: 'expiring' } });
        break;
      case 'stock':
        this.router.navigate(['/inventory/medicines'], { queryParams: { filter: 'low-stock' } });
        break;
      case 'maintenance':
        this.router.navigate(['/inventory/equipment'], { queryParams: { filter: 'maintenance-due' } });
        break;
    }
  }

  reorderItem(item: any) {
    const ref = this.dialogService.open(ReorderDialogComponent, {
      header: `Reorder ${item.name}`,
      width: '500px',
      data: { item }
    });

    ref.onClose.subscribe((order: PurchaseOrder) => {
      if (order) {
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Order Placed',
          detail: `Ordered ${order.quantity} units of ${item.name}`
        });
        
        // Refresh dashboard data
        this.loadDashboardData();
      }
    });
  }

  refreshDashboard() {
    this.loadDashboardData();
  }
}