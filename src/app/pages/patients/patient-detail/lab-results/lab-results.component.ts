import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { LabResultsService } from '../../services/lab-result.service';
import { LabReport, LabResult } from '../../models/lab-result.model';

@Component({
  selector: 'app-lab-results',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, TabViewModule],
  templateUrl: './lab-results.component.html'
})
export class LabResultsComponent implements OnInit {
  @Input() patientId!: string;

  labReports: LabReport[] = [];
  selectedReport: LabReport | null = null;
  trendData: any = {};
  timeRange: 'all' | '6months' | '1year' = '6months';
  categoryFilter: string = 'all';
  isLoading = false;
  displayTrend = false;
  selectedTest: LabResult | null = null;

  categories = [
    'Hematology',
    'Chemistry',
    'Microbiology',
    'Immunology',
    'Urinalysis'
  ];

  constructor(private labResultsService: LabResultsService) {}

  ngOnInit(): void {
    this.loadLabResults();
  }

  loadLabResults(): void {
    this.isLoading = true;
    const params = {
      timeRange: this.timeRange,
      category: this.categoryFilter !== 'all' ? this.categoryFilter : undefined
    };

    this.labResultsService.getPatientLabResults(this.patientId, params).subscribe({
      next: (reports) => {
        this.labReports = reports;
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading lab results:', error);
        this.isLoading = false;
      }
    });
  }

  prepareChartData(): void {
    if (!this.selectedTest) return;

    const testResults = this.labReports
      .flatMap(report => report.tests)
      .filter(test => test.testName === this.selectedTest?.testName)
      .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

    this.trendData = {
      labels: testResults.map(result => new Date(result.testDate).toLocaleDateString()),
      datasets: [
        {
          label: `${this.selectedTest.testName} (${this.selectedTest.unit})`,
          data: testResults.map(result => Number(result.result)),
          borderColor: '#2196F3',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Reference Range Max',
          data: testResults.map(() => this.selectedTest?.referenceRange.max),
          borderColor: '#4CAF50',
          borderDash: [5, 5],
          fill: false
        },
        {
          label: 'Reference Range Min',
          data: testResults.map(() => this.selectedTest?.referenceRange.min),
          borderColor: '#4CAF50',
          borderDash: [5, 5],
          fill: false
        }
      ]
    };
  }

  downloadReport(reportId: string): void {
    this.labResultsService.downloadReport(reportId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lab-report-${reportId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  showTrendAnalysis(test: LabResult): void {
    this.selectedTest = test;
    this.prepareChartData();
    this.displayTrend = true;
  }

  getStatusClass(status: string): string {
    const classes = {
      normal: 'bg-green-100 text-green-800',
      abnormal: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || '';
  }
}