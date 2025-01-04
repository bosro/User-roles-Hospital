// src/app/pages/doctors/components/patient-history/patient-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DoctorService } from '../../services/doctor.service'
import { MessageService } from 'primeng/api';
import { PatientVisit } from '../../doctors.model';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';


@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ChartModule,
    TabViewModule,
    AvatarModule,
    TooltipModule,
    DialogModule,
    CalendarModule
  ],
  templateUrl: 'patient-history.component.html'
})
export class PatientHistoryComponent implements OnInit {
  // Stats
  totalPatients = 0;
  totalVisits = 0;
  averageVisitDuration = 0;
  followUpRate = 0;

  // Table data
  recentVisits: PatientVisit[] = [];
  loading = false;
  selectedVisit: PatientVisit | null = null;
  showVisitDetails = false;

  // Chart configurations
  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  lineChartOptions = {
    ...this.chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  barChartOptions = {
    ...this.chartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  // Chart data
  ageDistributionData: any;
  visitTypesData: any;
  genderDistributionData: any;
  treatmentOutcomesData: any;
  visitTrendsData: any;
  diagnosesData: any;
  treatmentSuccessData: any;

  constructor(
    private doctorsService: DoctorService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.initializeChartData();
  }

  ngOnInit() {
    const doctorId = this.route.snapshot.params['id'];
    if (doctorId) {
      this.loadDoctorPatientHistory(doctorId);
    }
  }

  private loadDoctorPatientHistory(doctorId: string) {
    this.loading = true;
    
    // Load stats
    this.doctorsService.getPatientHistoryStats(doctorId).subscribe({
      next: (stats) => {
        this.totalPatients = stats.totalPatients;
        this.totalVisits = stats.totalVisits;
        this.averageVisitDuration = stats.averageVisitDuration;
        this.followUpRate = stats.followUpRate;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patient history statistics'
        });
      }
    });

    // Load recent visits
    this.doctorsService.getDoctorPatientVisits(doctorId).subscribe({
      next: (visits) => {
        this.recentVisits = visits;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patient visits'
        });
        this.loading = false;
      }
    });

    // Load analytics data
    this.doctorsService.getPatientAnalytics(doctorId).subscribe({
      next: (data) => {
        this.updateChartData(data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load analytics data'
        });
      }
    });
  }

  private initializeChartData() {
    // Initialize with empty data - will be updated when real data loads
    this.ageDistributionData = {
      labels: ['18-25', '26-35', '36-45', '46-55', '56+'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2']
      }]
    };

    this.visitTypesData = {
      labels: ['Consultation', 'Follow-up', 'Emergency', 'Procedure'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA']
      }]
    };

    // Initialize other chart data similarly
  }

  private updateChartData(data: any) {
    // Update chart data with real values
    this.ageDistributionData.datasets[0].data = data.ageDistribution;
    this.visitTypesData.datasets[0].data = data.visitTypes;
    // Update other charts similarly
  }

  getVisitTypeSeverity(type: PatientVisit['type']): TagSeverity {
    const severities: Record<PatientVisit['type'], TagSeverity> = {
      'consultation': 'info',
      'follow-up': 'success',
      'emergency': 'danger',
      'procedure': 'warn'
    };
    return severities[type];
  }

  getStatusSeverity(status: PatientVisit['status']): TagSeverity {
    const severities: Record<PatientVisit['status'], TagSeverity> = {
      'completed': 'success',
      'scheduled': 'info',
      'cancelled': 'danger'
    };
    return severities[status];
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    // Implement search logic
  }

  viewVisitDetails(visit: PatientVisit) {
    this.selectedVisit = visit;
    this.showVisitDetails = true;
  }

  viewMedicalRecords(visit: PatientVisit) {
    // Implement medical records view
    this.doctorsService.getPatientMedicalRecords(visit.id).subscribe({
      next: (records) => {
        // Handle records view
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load medical records'
        });
      }
    });
  }

  scheduleFollowUp(visit: PatientVisit) {
    // Implement follow-up scheduling logic
    // You might want to open a dialog or navigate to scheduling component
  }
}