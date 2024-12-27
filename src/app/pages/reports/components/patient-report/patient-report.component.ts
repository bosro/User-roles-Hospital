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

interface PatientMetrics {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  averageWaitTime: number;
  averageVisitDuration: number;
  patientsByDepartment: Record<string, number>;
  patientDemographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
  };
  waitTimeByHour: {
    hour: number;
    averageWait: number;
    patientCount: number;
  }[];
}

@Component({
  selector: 'app-patient-reports',
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
  templateUrl: 'patient-report.component.html'
})
export class PatientReportsComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedDepartment: string = '';
  selectedView: string = 'daily';
  metrics: PatientMetrics | null = null;
  patientList: any[] = [];

  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' }
  ];

  viewOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  demographicsData: any;
  waitTimeData: any;
  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    responsive: true
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
      reportType: this.selectedView
    };

    this.reportService.getPatientMetrics(filters).subscribe({
      next: (data) => {
        this.metrics = data;
        this.updateCharts();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patient metrics'
        });
      }
    });
  }

  private updateCharts() {
    if (!this.metrics) return;

    // Update demographics chart
    this.demographicsData = {
      labels: Object.keys(this.metrics.patientDemographics.ageGroups),
      datasets: [{
        data: Object.values(this.metrics.patientDemographics.ageGroups),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };

    // Update wait time chart
    this.waitTimeData = {
      labels: this.metrics.waitTimeByHour.map(h => `${h.hour}:00`),
      datasets: [{
        label: 'Average Wait Time',
        data: this.metrics.waitTimeByHour.map(h => h.averageWait),
        borderColor: '#4BC0C0',
        tension: 0.4
      }]
    };
  }
}