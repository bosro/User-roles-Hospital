import { ConfirmationService, MessageService } from "primeng/api";
import { ReportTemplate } from "../../models/report-template.model";
import { ToastModule } from "primeng/toast";
import { TableModule } from "primeng/table";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { Component, OnInit } from "@angular/core";
import { ReportService } from "../../services/reports.service";  

type ReportType = 'financial' | 'patient' | 'department' | 'inventory' | 'custom';


@Component({
  selector: 'app-report-templates',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    ToastModule
  ],
  templateUrl: 'report-template.component.html'
})
export class ReportTemplatesComponent implements OnInit {
  templates: ReportTemplate[] = [];
  loading = false;
  showPreviewDialog = false;
  selectedTemplate: ReportTemplate | null = null;

  constructor(
    private reportService: ReportService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  private loadTemplates() {
    this.loading = true;
    this.reportService.getReportTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load report templates'
        });
        this.loading = false;
      }
    });
  }


  getTemplateTypeClass(type: ReportType): string {
    const classes: Record<ReportType, string> = {
      'financial': 'bg-blue-100 text-blue-800',
      'patient': 'bg-green-100 text-green-800',
      'department': 'bg-orange-100 text-orange-800',
      'inventory': 'bg-purple-100 text-purple-800',
      'custom': 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[type]}`;
  }

  previewTemplate(template: ReportTemplate) {
    this.selectedTemplate = template;
    this.showPreviewDialog = true;
  }

  deleteTemplate(template: ReportTemplate) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete template "${template.name}"?`,
      accept: () => {
        this.reportService.deleteReportTemplate(template.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Report template deleted successfully'
            });
            this.loadTemplates();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete template'
            });
          }
        });
      }
    });
  }
}