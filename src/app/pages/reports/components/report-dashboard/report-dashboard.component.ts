import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { DropdownModule } from "primeng/dropdown";
import { MenuModule } from "primeng/menu";
import { TableModule } from "primeng/table";
import { ReportService } from "../../services/reports.service";  
import { ExportReportData, FinancialMetrics, GroupByPeriod, ReportFilters } from "../../models/reports.model";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ChartModule,
    CalendarModule,
    DropdownModule,
    MenuModule,
    TableModule,
    FormsModule
  ],
  templateUrl: 'report-dashboard.component.html',
  providers: [ReportService]  
})
export class ReportsDashboardComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedDepartment: string | null = null;
  selectedGroupBy: GroupByPeriod | null = null;

  departments = [
    { label: 'All Departments', value: null },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Orthopedics', value: 'orthopedics' },
    { label: 'Pediatrics', value: 'pediatrics' }
  ];

  groupByOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' }
  ];

  revenueTrendData: any;
  departmentPerformanceData: any;
  chartOptions: any;
  recentReports: any[] = [];

  constructor(
    private router: Router,
    private reportService: ReportService
  ) {
    this.initializeChartOptions();
    this.setDefaultDateRange();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private setDefaultDateRange() {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    this.dateRange = [start, end];
  }

  private initializeChartOptions() {
    this.chartOptions = {
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
            callback: (value: any) => `$${value}`
          }
        }
      }
    };
  }

  private loadDashboardData() {
    const filters: ReportFilters = {
      dateRange: {
        start: this.dateRange[0],
        end: this.dateRange[1]
      },
      department: this.selectedDepartment || undefined,
      groupBy: this.selectedGroupBy as any || 'month'
    };

    this.reportService.getFinancialMetrics(filters).subscribe(metrics => {
      this.updateCharts(metrics);
    });
  }

  private updateCharts(metrics: FinancialMetrics) {
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
        },
        {
          label: 'Profit',
          data: metrics.monthlyTrend.map(m => m.profit),
          borderColor: '#2196F3',
          tension: 0.4
        }
      ]
    };

    // Update department performance chart
    const departments = Object.keys(metrics.revenueByDepartment);
    this.departmentPerformanceData = {
      labels: departments,
      datasets: [{
        label: 'Revenue by Department',
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

  navigateToReport(type: string) {
    this.router.navigate(['/reports', type]);
  }

  onDateRangeChange() {
    if (this.dateRange?.length === 2) {
      this.loadDashboardData();
    }
  }

  onFiltersChange() {
    this.loadDashboardData();
  }

  getReportTypeClass(type: 'financial' | 'patient' | 'department' | 'inventory'): string {
    const classes: Record<string, string> = {
      'financial': 'bg-blue-100 text-blue-800',
      'patient': 'bg-green-100 text-green-800',
      'department': 'bg-orange-100 text-orange-800',
      'inventory': 'bg-purple-100 text-purple-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[type] || ''}`;
  }

  viewReport(report: any) {
    this.navigateToReport(report.type);
  }


  downloadReport(report: any) {
    const exportData: ExportReportData = {
      dateRange: {
        start: this.dateRange[0],
        end: this.dateRange[1]
      },
      department: this.selectedDepartment || undefined,
      // Only assign if it's a valid GroupByPeriod value
      groupBy: this.selectedGroupBy as GroupByPeriod | undefined,

      format: 'pdf',
      includeCharts: true,
      reportId: report.type,
      
      title: report.name,
      description: `Report generated for period: ${this.dateRange[0].toLocaleDateString()} - ${this.dateRange[1].toLocaleDateString()}`,
      includeSummary: true
    };
  
    this.reportService.exportReport(report.type, exportData).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading report:', error);
      }
    });
  }
}
