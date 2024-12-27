import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ReportService } from '../../services/reports.service';

interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  totalValue: number;
  stockByCategory: Record<string, number>;
  usageStats: {
    item: string;
    quantity: number;
    value: number;
    trend: number;
  }[];
  monthlyConsumption: {
    month: string;
    consumption: number;
    purchases: number;
  }[];
}

@Component({
  selector: 'app-inventory-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: 'inventory-reports.component.html'
})
export class InventoryReportsComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedCategory: string = '';
  selectedViewType: string = 'value';
  metrics: InventoryMetrics | null = null;

  categories = [
    { label: 'All Categories', value: '' },
    { label: 'Medications', value: 'medications' },
    { label: 'Supplies', value: 'supplies' },
    { label: 'Equipment', value: 'equipment' }
  ];

  viewTypes = [
    { label: 'Value', value: 'value' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Usage', value: 'usage' }
  ];

  categoryData: any;
  consumptionData: any;
  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(
    private reportService: ReportService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadMetrics();
  }

  private setDefaultDateRange() {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    this.dateRange = [start, end];
  }

  loadMetrics() {
    if (!this.dateRange || this.dateRange.length !== 2) return;

    const filters = {
      dateRange: {
        start: this.dateRange[0],
        end: this.dateRange[1]
      },
      category: this.selectedCategory,
      viewType: this.selectedViewType
    };

    this.reportService.getInventoryMetrics(filters).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateCharts();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load inventory metrics'
        });
      }
    });
  }

  private updateCharts() {
    if (!this.metrics) return;

    // Update category chart
    this.categoryData = {
      labels: Object.keys(this.metrics.stockByCategory),
      datasets: [{
        data: Object.values(this.metrics.stockByCategory),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };

    // Update consumption chart
    this.consumptionData = {
      labels: this.metrics.monthlyConsumption.map(m => m.month),
      datasets: [
        {
          label: 'Consumption',
          data: this.metrics.monthlyConsumption.map(m => m.consumption),
          backgroundColor: '#FF6384'
        },
        {
          label: 'Purchases',
          data: this.metrics.monthlyConsumption.map(m => m.purchases),
          backgroundColor: '#36A2EB'
        }
      ]
    };
  }
}