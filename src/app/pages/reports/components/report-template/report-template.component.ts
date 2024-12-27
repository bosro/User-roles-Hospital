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
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Report Templates</h2>
        <p-button 
          label="Create Template" 
          icon="ri-add-line"
          routerLink="new">
        </p-button>
      </div>

      <p-card>
        <p-table 
          [value]="templates" 
          [paginator]="true" 
          [rows]="10"
          [loading]="loading"
          styleClass="p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Created By</th>
              <th>Last Updated</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-template>
            <tr>
              <td>{{template.name}}</td>
              <td>
                <span [class]="getTemplateTypeClass(template.type)">
                  {{template.type}}
                </span>
              </td>
              <td>{{template.createdBy}}</td>
              <td>{{template.updatedAt | date:'medium'}}</td>
              <td>
                <span *ngIf="template.schedule?.active" 
                      class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {{template.schedule.frequency}}
                </span>
                <span *ngIf="!template.schedule?.active" 
                      class="text-gray-500">
                  Not scheduled
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button 
                    icon="ri-eye-line" 
                    severity="secondary"
                    tooltipPosition="top"
                    pTooltip="Preview"
                    (onClick)="previewTemplate(template)">
                  </p-button>
                  <p-button 
                    icon="ri-edit-line" 
                    severity="secondary"
                    tooltipPosition="top"
                    pTooltip="Edit"
                    [routerLink]="['edit', template.id]">
                  </p-button>
                  <p-button 
                    icon="ri-delete-bin-line" 
                    severity="danger"
                    tooltipPosition="top"
                    pTooltip="Delete"
                    (onClick)="deleteTemplate(template)">
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

  getTemplateTypeClass(type: string): string {
    const classes = {
      'financial': 'bg-blue-100 text-blue-800',
      'patient': 'bg-green-100 text-green-800',
      'department': 'bg-orange-100 text-orange-800',
      'inventory': 'bg-purple-100 text-purple-800',
      'custom': 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[type] || ''}`;
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