import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import * as FileSaver from 'file-saver';
import {
  ChartData,
  DashboardAppointment,
  DashboardService,
  Department,
} from '../services/dashboard.service';

interface StatCard {
  type: string;
  title: string;
  value: number | string;
  subtext: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  appointmentsToday: number;
  pendingBills: number;
  occupiedBeds: number;
  totalBeds: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ChartModule,
    CardModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    TooltipModule,
    TabViewModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    appointmentsToday: 0,
    pendingBills: 0,
    occupiedBeds: 0,
    totalBeds: 0,
  };
  recentAppointments: DashboardAppointment[] = [];
  departments: { label: string; value: string }[] = [];
  statCards: StatCard[] = [];

  patientData: any;
  revenueData: any;
  departmentData: any;

  @ViewChild('dt') table: any;

  selectedTimeRange = 'week';
  dateRange: Date[] = [];
  showDetailDialog = false;
  selectedMetric: any = null;
  exportLoading = false;
  activeTabIndex = 0;

  // Chart Data

  waitingTimeData: any;
  satisfactionData: any;
  resourceUtilizationData: any;

  // Interactive Filters
  departmentFilter: string = 'all';
  timeRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  constructor(private dashboardService: DashboardService) {
    // this.initializeCharts();
  }

  ngOnInit() {
    this.loadDashboardData();
    this.loadRecentAppointments();
    this.initializeStatCards();
  }

  private initializeStatCards() {
    this.statCards = [
      {
        type: 'patients',
        title: 'Total Patients',
        value: this.stats.totalPatients,
        subtext: '+5.2% from last month',
        icon: 'pi pi-users',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-500'
      },
      {
        type: 'appointments',
        title: 'Today\'s Appointments',
        value: this.stats.appointmentsToday,
        subtext: `${this.stats.appointmentsToday} scheduled`,
        icon: 'pi pi-calendar',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-500'
      },
      {
        type: 'occupancy',
        title: 'Bed Occupancy',
        value: `${this.stats.occupiedBeds}/${this.stats.totalBeds}`,
        subtext: `${((this.stats.occupiedBeds / this.stats.totalBeds) * 100).toFixed(1)}% occupied`,
        icon: 'pi pi-home',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-500'
      },
      {
        type: 'revenue',
        title: 'Total Revenue',
        value: `$${this.stats.totalRevenue.toLocaleString()}`,
        subtext: `${this.stats.pendingBills} pending bills`,
        icon: 'pi pi-dollar',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-500'
      }
    ];
  }

  // private initializeCharts(): void {
  //   // Enhanced Patient Data with multiple datasets
  //   this.patientData = {
  //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  //     datasets: [
  //       {
  //         label: 'New Patients',
  //         data: [65, 59, 80, 81, 56, 55],
  //         fill: false,
  //         borderColor: '#4CAF50',
  //         tension: 0.4,
  //       },
  //       {
  //         label: 'Return Visits',
  //         data: [28, 48, 40, 19, 86, 27],
  //         fill: false,
  //         borderColor: '#2196F3',
  //         tension: 0.4,
  //       },
  //     ],
  //   };

  //   // Enhanced Revenue Data with stacked bars
  //   this.revenueData = {
  //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  //     datasets: [
  //       {
  //         label: 'Consultations',
  //         data: [12000, 19000, 15000, 17000, 22000, 20000],
  //         backgroundColor: '#2196F3',
  //       },
  //       {
  //         label: 'Procedures',
  //         data: [9000, 15000, 12000, 13000, 18000, 16000],
  //         backgroundColor: '#4CAF50',
  //       },
  //       {
  //         label: 'Pharmacy',
  //         data: [5000, 7000, 6000, 8000, 9000, 8000],
  //         backgroundColor: '#FFC107',
  //       },
  //     ],
  //   };

  //   // New Waiting Time Analysis
  //   this.waitingTimeData = {
  //     labels: ['Emergency', 'Outpatient', 'Laboratory', 'Pharmacy'],
  //     datasets: [
  //       {
  //         label: 'Average Wait Time (minutes)',
  //         data: [15, 45, 20, 30],
  //         backgroundColor: '#FF9800',
  //         borderColor: '#F57C00',
  //         borderWidth: 1,
  //       },
  //     ],
  //   };

  //   // Patient Satisfaction Metrics
  //   this.satisfactionData = {
  //     labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
  //     datasets: [
  //       {
  //         data: [45, 30, 15, 10],
  //         backgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#FF5722'],
  //       },
  //     ],
  //   };

  //   // Resource Utilization
  //   this.resourceUtilizationData = {
  //     labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'],
  //     datasets: [
  //       {
  //         label: 'Staff Utilization',
  //         data: [65, 85, 95, 80, 75, 60],
  //         fill: true,
  //         backgroundColor: 'rgba(33, 150, 243, 0.2)',
  //         borderColor: '#2196F3',
  //         tension: 0.4,
  //       },
  //       {
  //         label: 'Equipment Usage',
  //         data: [70, 90, 85, 75, 80, 65],
  //         fill: true,
  //         backgroundColor: 'rgba(76, 175, 80, 0.2)',
  //         borderColor: '#4CAF50',
  //         tension: 0.4,
  //       },
  //     ],
  //   };
  // }

  updateChartData(): void {
    this.dashboardService
      .getChartData(this.selectedTimeRange, this.departmentFilter)
      .subscribe({
        next: (data: ChartData) => {
          this.patientData = { ...this.patientData, ...data.patientData };
          this.revenueData = { ...this.revenueData, ...data.revenueData };
        },
      });
  }

  exportPDF(): void {
    this.exportLoading = true;
    this.dashboardService.exportDashboardPDF(this.selectedTimeRange).subscribe({
      next: (blob: Blob) => {
        FileSaver.saveAs(
          blob,
          `dashboard-report-${new Date().toISOString()}.pdf`
        );
        this.exportLoading = false;
      },
      error: () => (this.exportLoading = false),
    });
  }

  exportExcel(): void {
    this.exportLoading = true;
    this.dashboardService
      .exportDashboardExcel(this.selectedTimeRange)
      .subscribe({
        next: (blob: Blob) => {
          FileSaver.saveAs(
            blob,
            `dashboard-report-${new Date().toISOString()}.xlsx`
          );
          this.exportLoading = false;
        },
        error: () => (this.exportLoading = false),
      });
  }

  showMetricDetails(metric: string): void {
    this.selectedMetric = metric;
    this.showDetailDialog = true;
  }

  applyDateFilter(): void {
    if (this.dateRange?.length === 2) {
      this.updateChartData();
    }
  }

  private loadDepartments(): void {
    this.dashboardService.getDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments.map((dept) => ({
          label: dept.name,
          value: dept.id,
        }));
      },
    });
  }
  private loadDashboardData() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.initializeStatCards(); // Update cards when stats are loaded
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  private loadRecentAppointments(): void {
    this.dashboardService.getRecentAppointments().subscribe({
      next: (appointments) => {
        this.recentAppointments = appointments;
      },
      error: (error) => {
        console.error('Error loading recent appointments:', error);
      },
    });
  }
}
