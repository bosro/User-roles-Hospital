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

interface DepartmentMetrics {
  totalRevenue: number;
  totalPatients: number;
  averageVisitDuration: number;
  staffUtilization: number;
  revenueByService: Record<string, number>;
  performanceMetrics: {
    waitTime: number;
    patientSatisfaction: number;
    staffEfficiency: number;
  };
  hourlyStats: {
    hour: number;
    patients: number;
    revenue: number;
    staffLevel: number;
  }[];
}

@Component({
  selector: 'app-department-reports',
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
  template: `

  `
})
export class DepartmentReportsComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedDepartment: string = '';
  selectedMetricType: string = 'revenue';
  metrics: DepartmentMetrics | null = null;
  staffList: any[] = [];

  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' }
  ];

  metricTypes = [
    { label: 'Revenue', value: 'revenue' },
    { label: 'Patient Volume', value: 'patients' },
    { label: 'Staff Utilization', value: 'staff' }
  ];

  revenueData: any;
  hourlyData: any;
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
      department: this.selectedDepartment,
      reportType: this.selectedMetricType
    };

    this.reportService.getDepartmentMetrics(filters).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateCharts();
        this.loadStaffData();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load department metrics'
        });
      }
    });
  }

  private updateCharts() {
    if (!this.metrics) return;

    // Update revenue by service chart
    this.revenueData = {
      labels: Object.keys(this.metrics.revenueByService),
      datasets: [{
        data: Object.values(this.metrics.revenueByService),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };

    // Update hourly statistics chart
    this.hourlyData = {
      labels: this.metrics.hourlyStats.map(h => `${h.hour}:00`),
      datasets: [
        {
          label: 'Patients',
          data: this.metrics.hourlyStats.map(h => h.patients),
          backgroundColor: '#36A2EB'
        },
        {
          label: 'Revenue',
          data: this.metrics.hourlyStats.map(h => h.revenue),
          backgroundColor: '#FF6384'
        },
        {
          label: 'Staff Level',
          data: this.metrics.hourlyStats.map(h => h.staffLevel),
          backgroundColor: '#4BC0C0'
        }
      ]
    };
  }

  private loadStaffData() {
    // Simulated staff data - replace with actual API call
    this.staffList = [
      {
        id: 'ST001',
        name: 'Dr. John Smith',
        role: 'Physician',
        patientsSeen: 45,
        efficiency: 92,
        satisfaction: 88
      },
      {
        id: 'ST002',
        name: 'Dr. Sarah Johnson',
        role: 'Specialist',
        patientsSeen: 38,
        efficiency: 95,
        satisfaction: 91
      }
    ];
  }
}