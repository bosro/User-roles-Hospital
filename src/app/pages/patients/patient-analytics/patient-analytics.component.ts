import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { PatientService } from "../services/patient.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-patient-analytics',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    CardModule,
    ChartModule,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: 'patient-analytics.component.html'
})
export class PatientAnalyticsComponent implements OnInit {
  today = new Date();
  dateRange: Date[] = [];
  selectedDepartment: string = '';
  selectedView: string = 'monthly';

  analytics = {
    totalPatients: 0,
    newPatients: 0,
    averageVisits: 0,
    satisfaction: 0
  };

  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' }
  ];

  viewTypes = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  registrationChart: any;
  ageDistributionChart: any;
  departmentChart: any;
  genderChart: any;
  chartOptions: any = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadAnalytics();
  }

  private setDefaultDateRange() {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    this.dateRange = [start, end];
  }

  loadAnalytics() {
    // Load analytics data and update charts
    // Implementation depends on your API structure
  }

  private updateCharts() {
    // Update chart data based on analytics
  }
}