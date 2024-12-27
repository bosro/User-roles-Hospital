// src/app/pages/reports/components/reports-dashboard/reports-dashboard.component.ts
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
    TableModule
  ],
  template: `
    <div class="p-4">
      <!-- Report Navigation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="cursor-pointer hover:shadow-lg transition-shadow"
                (click)="navigateToReport('financial')">
          <div class="flex items-center">
            <i class="ri-money-dollar-circle-line text-3xl mr-3 text-blue-500"></i>
            <div>
              <h3 class="text-xl font-semibold">Financial Reports</h3>
              <p class="text-gray-600">Revenue and expense analysis</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="cursor-pointer hover:shadow-lg transition-shadow"
                (click)="navigateToReport('patient')">
          <div class="flex items-center">
            <i class="ri-user-heart-line text-3xl mr-3 text-green-500"></i>
            <div>
              <h3 class="text-xl font-semibold">Patient Reports</h3>
              <p class="text-gray-600">Patient statistics and trends</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="cursor-pointer hover:shadow-lg transition-shadow"
                (click)="navigateToReport('department')">
          <div class="flex items-center">
            <i class="ri-hospital-line text-3xl mr-3 text-orange-500"></i>
            <div>
              <h3 class="text-xl font-semibold">Department Reports</h3>
              <p class="text-gray-600">Department performance</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="cursor-pointer hover:shadow-lg transition-shadow"
                (click)="navigateToReport('inventory')">
          <div class="flex items-center">
            <i class="ri-stock-line text-3xl mr-3 text-purple-500"></i>
            <div>
              <h3 class="text-xl font-semibold">Inventory Reports</h3>
              <p class="text-gray-600">Stock and usage analysis</p>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Quick Filters -->
      <p-card styleClass="mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <p-calendar 
              [(ngModel)]="dateRange" 
              selectionMode="range"
              [showIcon]="true"
              [maxDate]="today"
              (onSelect)="onDateRangeChange()"
              styleClass="w-full">
            </p-calendar>
          </div>

          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <p-dropdown 
              [options]="departments"
              [(ngModel)]="selectedDepartment"
              (onChange)="onFiltersChange()"
              [style]="{'width':'100%'}"
              placeholder="All Departments">
            </p-dropdown>
          </div>

          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Group By
            </label>
            <p-dropdown 
              [options]="groupByOptions"
              [(ngModel)]="selectedGroupBy"
              (onChange)="onFiltersChange()"
              [style]="{'width':'100%'}"
              placeholder="Select Grouping">
            </p-dropdown>
          </div>
        </div>
      </p-card>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Revenue Trend -->
        <p-card header="Revenue Trend">
          <p-chart 
            type="line" 
            [data]="revenueTrendData"
            [options]="chartOptions">
          </p-chart>
        </p-card>

        <!-- Department Performance -->
        <p-card header="Department Performance">
          <p-chart 
            type="bar" 
            [data]="departmentPerformanceData"
            [options]="chartOptions">
          </p-chart>
        </p-card>
      </div>

      <!-- Recent Reports -->
      <p-card header="Recently Generated Reports">
        <p-table 
          [value]="recentReports" 
          [rows]="5"
          styleClass="p-datatable-sm"
          [scrollable]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Generated On</th>
              <th>Generated By</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-report>
            <tr>
              <td>{{report.name}}</td>
              <td>
                <span [class]="getReportTypeClass(report.type)">
                  {{report.type}}
                </span>
              </td>
              <td>{{report.generatedOn | date:'medium'}}</td>
              <td>{{report.generatedBy}}</td>
              <td>
                <div class="flex gap-2">
                  <p-button 
                    icon="ri-eye-line" 
                    severity="secondary"
                    (onClick)="viewReport(report)">
                  </p-button>
                  <p-button 
                    icon="ri-download-line" 
                    severity="secondary"
                    (onClick)="downloadReport(report)">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedDepartment: string | null = null;
  selectedGroupBy: string | null = null;

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

  getReportTypeClass(type: string): string {
    const classes = {
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
    const filters: ReportFilters = {
      dateRange: {
        start: this.dateRange[0],
        end: this.dateRange[1]
      }
    };

    this.reportService.exportReport(report.type, filters).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }
}