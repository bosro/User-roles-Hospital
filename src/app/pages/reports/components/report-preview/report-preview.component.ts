import { MessageService } from 'primeng/api';
import { ReportService } from '../../services/reports.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import {   Component, Input, OnInit } from '@angular/core';
import { ReportTemplate } from '../../models/report-template.model';
import { ExportReportData, GroupByPeriod, ShareReportData } from '../../models/reports.model';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChartModule,
    TableModule,
    TooltipModule,
    DialogModule,
    CheckboxModule,
    DropdownModule,
    FormsModule,
    ChipModule
  ],
  templateUrl: 'report-preview.component.html',
})
export class ReportPreviewComponent implements OnInit {
  @Input() report: any; // Report data
  @Input() template?: ReportTemplate;

  generatedDate = new Date();
  showShareOptions = false;
  showExportOptions = false;

  shareType: string = '';
  shareRecipients: string[] = [];
  shareMessage: string = '';

  exportFormat: string = '';
  includeCharts: boolean = true;

  shareTypes = [
    { label: 'Email', value: 'email' },
    { label: 'Generate Link', value: 'link' },
  ];

  exportFormats = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' },
  ];

  constructor(
    private reportService: ReportService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Initialize report data if needed
  }

  getChartData(section: any): any {
    // Transform section data into chart format
    return {};
  }

  getChartOptions(section: any): any {
    // Get chart-specific options
    return {};
  }

  getTableData(section: any): any[] {
    // Transform section data into table format
    return [];
  }

  getMetricsData(section: any): any[] {
    // Transform section data into metrics format
    return [];
  }

  formatCellValue(value: any, field: string): string {
    // Format cell value based on field type
    return '';
  }

  formatMetricValue(metric: any): string {
    // Format metric value with appropriate unit
    return '';
  }

  getMetricValueClass(metric: any): string {
    // Get CSS class based on metric value
    return '';
  }

  getTrendClass(trend: number): string {
    return trend > 0
      ? 'text-green-600'
      : trend < 0
      ? 'text-red-600'
      : 'text-gray-600';
  }

  getTrendIcon(trend: number): string {
    return trend > 0
      ? 'ri-arrow-up-line'
      : trend < 0
      ? 'ri-arrow-down-line'
      : 'ri-subtract-line';
  }

  getSummaryContent(section: any): string {
    // Transform section data into formatted HTML
    return '';
  }

  showShareDialog() {
    this.shareType = '';
    this.shareRecipients = [];
    this.shareMessage = '';
    this.showShareOptions = true;
  }

  showExportDialog() {
    this.exportFormat = 'pdf';
    this.includeCharts = true;
    this.showExportOptions = true;
  }

  currentEmail = ''; // Add this property

  addEmail() {
    if (this.currentEmail && this.isValidEmail(this.currentEmail)) {
      if (!this.shareRecipients.includes(this.currentEmail)) {
        this.shareRecipients.push(this.currentEmail);
      }
      this.currentEmail = '';
    }
  }

  removeEmail(email: string) {
    this.shareRecipients = this.shareRecipients.filter(e => e !== email);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  shareReport() {
    const shareData: ShareReportData = {
      type: this.shareType as 'email' | 'link',
      recipients: this.shareRecipients,
      message: this.shareMessage,
      reportId: this.report.id,
    };

    this.reportService.shareReport(shareData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report shared successfully',
        });
        this.showShareOptions = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to share report',
        });
      },
    });
  }

  exportReport() {
    // Get the report's date range or use a default range if not available
    const currentDate = new Date();
    const defaultDateRange = {
      start: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
      end: new Date()
    };

    const exportData: ExportReportData = {
      // Required properties from ReportFilters
      dateRange: this.report?.dateRange || defaultDateRange,
      department: this.report?.department,
      doctor: this.report?.doctor,
      reportType: this.report?.type,
      groupBy: this.report?.groupBy as GroupByPeriod | undefined,

      // Required properties from ExportReportData
      format: this.exportFormat as 'pdf' | 'excel' | 'csv',
      includeCharts: this.includeCharts,
      reportId: this.report.id,
      
      // Optional properties
      title: this.report.name,
      description: `Report exported on ${new Date().toLocaleDateString()}`,
      includeTransactions: true,
      includeSummary: true
    };

    this.reportService.exportReport(this.report.id, exportData).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.report.name}_${new Date().getTime()}.${this.exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showExportOptions = false;
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


  printReport() {
    window.print();
  }
}
