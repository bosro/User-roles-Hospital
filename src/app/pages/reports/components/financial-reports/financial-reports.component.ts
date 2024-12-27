import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FinancialMetrics, ReportFilters } from '../../models/reports.model';
import { ReportService } from '../../services/reports.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

interface TransactionType {
  revenue: string;
  expense: string;
  insurance: string;
  refund: string;
}

interface StatusType {
  completed: string;
  pending: string;
  failed: string;
}

interface Transaction {
  date: Date;
  type: keyof TransactionType;
  department: string;
  description: string;
  amount: number;
  status: keyof StatusType;
}

interface ChartOptions {
  plugins: {
    legend: {
      position?: 'bottom' | 'top' | 'left' | 'right';
      labels: {
        usePointStyle: boolean;
      };
    };
  };
  responsive: boolean;
  maintainAspectRatio: boolean;
  scales?: {
    y: {
      beginAtZero: boolean;
      ticks: {
        callback: (value: number) => string;
      };
    };
  };
}

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    FormsModule
  ],
  templateUrl: 'financial-reports.component.html'
})
export class FinancialReportsComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedReportType: string | null = null;
  metrics: FinancialMetrics | null = null;

  reportTypes = [
    { label: 'Revenue Analysis', value: 'revenue' },
    { label: 'Expense Analysis', value: 'expense' },
    { label: 'Profit & Loss', value: 'pnl' },
    { label: 'Department Revenue', value: 'department' },
    { label: 'Insurance Claims', value: 'insurance' }
  ];

  revenueTrendData: any; // Consider creating a specific type for chart data
  revenueDistributionData: any; // Consider creating a specific type for chart data
  transactions: Transaction[] = [];
  lineChartOptions!: ChartOptions;
  pieChartOptions!: ChartOptions;

  private readonly transactionTypeClasses: TransactionType = {
    revenue: 'bg-green-100 text-green-800',
    expense: 'bg-red-100 text-red-800',
    insurance: 'bg-blue-100 text-blue-800',
    refund: 'bg-orange-100 text-orange-800'
  };

  private readonly statusClasses: StatusType = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  constructor(
    private reportService: ReportService,
    private messageService: MessageService
  ) {
    this.initializeChartOptions();
    this.setDefaultDateRange();
  }

  ngOnInit(): void {
    this.loadReportData();
  }

  private setDefaultDateRange(): void {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    this.dateRange = [start, end];
  }

  private initializeChartOptions(): void {
    this.lineChartOptions = {
      plugins: {
        legend: {
          labels: { usePointStyle: true }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => `$${value}`
          }
        }
      }
    };

    this.pieChartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  private loadReportData(): void {
    if (!this.dateRange || this.dateRange.length !== 2) return;

    const filters: ReportFilters = {
      dateRange: {
        start: this.dateRange[0],
        end: this.dateRange[1]
      },
      reportType: this.selectedReportType || undefined
    };

    this.reportService.getFinancialMetrics(filters).subscribe({
      next: (metrics: FinancialMetrics) => {
        this.metrics = metrics;
        this.updateCharts(metrics);
        this.loadTransactions(filters);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load financial metrics'
        });
      }
    });
  }

  private updateCharts(metrics: FinancialMetrics): void {
    // Update revenue trend chart
    this.revenueTrendData = {
      labels: metrics.monthlyTrend.map(m => m.month),
      datasets: [
        {
          label: 'Revenue',
          data: metrics.monthlyTrend.map(m => m.revenue),
          borderColor: '#4CAF50',
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: metrics.monthlyTrend.map(m => m.expenses),
          borderColor: '#F44336',
          tension: 0.4
        }
      ]
    };

    // Update revenue distribution chart
    const departments = Object.keys(metrics.revenueByDepartment);
    this.revenueDistributionData = {
      labels: departments,
      datasets: [{
        data: departments.map(d => metrics.revenueByDepartment[d]),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FFC107',
          '#9C27B0',
          '#FF5722'
        ]
      }]
    };
  }

  private loadTransactions(filters: ReportFilters): void {
    // Load transaction details
  }

  onFiltersChange(): void {
    this.loadReportData();
  }

  exportReport(): void {
    if (!this.dateRange || this.dateRange.length !== 2) return;

    const filters: ReportFilters = {
      dateRange: {
        start: this.dateRange[0],
        end: this.dateRange[1]
      },
      reportType: this.selectedReportType || undefined
    };

    this.reportService.exportReport('financial', filters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial_report_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to export report'
        });
      }
    });
  }

  getTransactionTypeClass(type: keyof TransactionType): string {
    return `px-2 py-1 rounded-full text-xs font-medium ${this.transactionTypeClasses[type]}`;
  }

  getAmountClass(amount: number): string {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getStatusClass(status: keyof StatusType): string {
    return `px-2 py-1 rounded-full text-xs font-medium ${this.statusClasses[status]}`;
  }

  getTotal(): number {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }
}