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
    ShareModule
  ],
  templateUrl: 'report-preview.component.html'
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
    { label: 'Generate Link', value: 'link' }
  ];

  exportFormats = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' }
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
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  }

  getTrendIcon(trend: number): string {
    return trend > 0 ? 'ri-arrow-up-line' : trend < 0 ? 'ri-arrow-down-line' : 'ri-subtract-line';
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

  shareReport() {
    const shareData = {
      type: this.shareType,
      recipients: this.shareRecipients,
      message: this.shareMessage,
      reportId: this.report.id
    };

    this.reportService.shareReport(shareData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report shared successfully'
        });
        this.showShareOptions = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to share report'
        });
      }
    });
  }

  exportReport() {
    const exportData = {
      format: this.exportFormat,
      includeCharts: this.includeCharts,
      reportId: this.report.id
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