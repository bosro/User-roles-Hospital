// src/app/pages/inventory/components/inventory-dashboard/inventory-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

type AlertType = 'expiry' | 'stock' | 'maintenance';
type ActivityStatus = 'completed' | 'pending' | 'failed';
type ButtonSeverity = 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface Alert {
  type: 'expiry' | 'stock' | 'maintenance';
  title: string;
  message: string;
}

interface Activity {
  timestamp: Date;
  description: string;
  user: string;
  status: 'completed' | 'pending' | 'failed';
}
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
    TagModule
  ],
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

  constructor() {
    this.initializeChartData();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private initializeChartData() {
    this.stockChartData = {
      labels: ['Medicines', 'Equipment', 'Supplies'],
      datasets: [
        {
          label: 'Current Stock',
          data: [65, 59, 80],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
        },
        {
          label: 'Reorder Level',
          data: [40, 30, 45],
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
    // Load data from service
    // This is mock data for demonstration
    this.criticalAlerts = [
      {
        type: 'expiry',
        title: 'Expiring Items',
        message: '5 medicines expiring within 30 days'
      },
      {
        type: 'stock',
        title: 'Low Stock Alert',
        message: '3 items below reorder level'
      }
    ];

    this.recentActivities = [
      {
        timestamp: new Date(),
        description: 'Restocked Paracetamol',
        user: 'John Doe',
        status: 'completed'
      }
    ];

    this.lowStockItemsList = [
      {
        name: 'Paracetamol 500mg',
        code: 'MED001',
        quantity: 50,
        unit: 'tablets',
        reorderLevel: 100
      }
    ];
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
    if (item.quantity <= item.reorderLevel * 0.5) {
      return 'text-red-500 font-medium';
    }
    if (item.quantity <= item.reorderLevel) {
      return 'text-yellow-500 font-medium';
    }
    return 'text-green-500 font-medium';
  }

  handleAlert(alert: any) {
    // Handle alert action
  }

  reorderItem(item: any) {
    // Handle reorder action
  }
}