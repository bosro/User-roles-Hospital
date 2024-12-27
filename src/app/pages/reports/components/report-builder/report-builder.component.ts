import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { ChipModule } from 'primeng/chip';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ReportService } from "../../services/reports.service";
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";
import {  ReportSection, SectionIcons } from "../../models/reports.model";
import { ReportTemplate } from "../../models/report-template.model";
import { MultiSelectModule } from "primeng/multiselect";
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    DragDropModule,
    DialogModule,
    ToastModule,
    ChipModule,
    MultiSelectModule,
    InputNumberModule
  ],
  templateUrl: 'report-builder.component.html',
})

export class ReportBuilderComponent implements OnInit {
  @Input() templateId?: string;
  
  templateForm!: FormGroup;
  sectionForm!: FormGroup;
  saving = false;
  showSectionDialog = false;
  showPreviewDialog = false;
  editingSection: number | null = null;
  showScheduleSettings = false;

  private readonly sectionIcons: SectionIcons = {
    chart: 'ri-line-chart-line',
    table: 'ri-table-2',
    metrics: 'ri-dashboard-3-line',
    summary: 'ri-file-text-line'
  };

  isEditMode: boolean = false;
  departments = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' },
    { label: 'Orthopedics', value: 'orthopedics' }
  ];

  groupByOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' }
  ];

  availableMetrics = [
    { label: 'Revenue', value: 'revenue' },
    { label: 'Expenses', value: 'expenses' },
    { label: 'Profit', value: 'profit' },
    { label: 'Patient Count', value: 'patientCount' },
    { label: 'Average Wait Time', value: 'waitTime' }
  ];

  availableColumns = [
    { label: 'Date', value: 'date' },
    { label: 'Department', value: 'department' },
    { label: 'Revenue', value: 'revenue' },
    { label: 'Expenses', value: 'expenses' },
    { label: 'Profit', value: 'profit' }
  ];

  reportTypes = [
    { label: 'Financial Report', value: 'financial' },
    { label: 'Patient Report', value: 'patient' },
    { label: 'Department Report', value: 'department' },
    { label: 'Inventory Report', value: 'inventory' },
    { label: 'Custom Report', value: 'custom' }
  ];

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Last Quarter', value: 'quarter' },
    { label: 'Last Year', value: 'year' },
    { label: 'Custom', value: 'custom' }
  ];

  frequencies = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  sectionTypes = [
    { label: 'Chart', value: 'chart' },
    { label: 'Table', value: 'table' },
    { label: 'Metrics', value: 'metrics' },
    { label: 'Summary', value: 'summary' }
  ];

  chartTypes = [
    { label: 'Line Chart', value: 'line' },
    { label: 'Bar Chart', value: 'bar' },
    { label: 'Pie Chart', value: 'pie' },
    { label: 'Doughnut Chart', value: 'doughnut' }
  ];

  // Add more options...

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    if (this.templateId) {
      this.loadTemplate();
    }
  }

  get sections() {
    return this.templateForm.get('sections') as FormArray;
  }

  get schedule() {
    return this.templateForm.get('schedule') as FormGroup;
  }

  private initializeForms() {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      filters: this.fb.group({
        dateRange: ['month'],
        department: [''],
        groupBy: ['']
      }),
      sections: this.fb.array([]),
      schedule: this.fb.group({
        active: [false],
        frequency: ['daily'],
        time: [null],
        recipients: [[]]
      })
    });

    this.initializeSectionForm();
  }

  private initializeSectionForm() {
    this.sectionForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      config: this.fb.group({
        chartType: [''],
        metrics: [[]],
        columns: [[]],
        sortBy: [''],
        limit: [10],
        groupBy: ['']
      })
    });

    // Listen for section type changes
    this.sectionForm.get('type')?.valueChanges.subscribe(type => {
      this.updateConfigValidators(type);
    });
  }

  private updateConfigValidators(type: string) {
    const configGroup = this.sectionForm.get('config') as FormGroup;
    
    // Reset validators
    Object.keys(configGroup.controls).forEach(key => {
      configGroup.get(key)?.clearValidators();
      configGroup.get(key)?.updateValueAndValidity();
    });

    // Add validators based on section type
    switch (type) {
      case 'chart':
        configGroup.get('chartType')?.setValidators(Validators.required);
        configGroup.get('metrics')?.setValidators([Validators.required, Validators.minLength(1)]);
        break;
      case 'table':
        configGroup.get('columns')?.setValidators([Validators.required, Validators.minLength(1)]);
        configGroup.get('limit')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 'metrics':
        configGroup.get('metrics')?.setValidators([Validators.required, Validators.minLength(1)]);
        break;
    }

    configGroup.updateValueAndValidity();
  }


  private loadTemplate(): void {
    this.reportService.getTemplate(this.templateId!).subscribe({
      next: (template: ReportTemplate) => {
        while (this.sections.length) {
          this.sections.removeAt(0);
        }
        
        template.sections.forEach((section:any) => {
          this.sections.push(this.fb.group(section));
        });

        this.templateForm.patchValue({
          name: template.name,
          description: template.description,
          type: template.type,
          filters: template.filters,
          schedule: template.schedule || {
            active: false,
            frequency: 'daily',
            time: null,
            recipients: []
          }
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load report template'
        });
      }
    });
  }

  openSectionDialog(): void {
    this.sectionForm.reset({
      type: '',
      title: '',
      config: {
        limit: 10
      }
    });
    this.editingSection = null;
    this.showSectionDialog = true;
  }

  editSection(index: number): void {
    this.editingSection = index;
    const section = this.sections.at(index);
    this.sectionForm.patchValue(section.value);
    this.showSectionDialog = true;
  }

  

 

  saveSection() {
    if (this.sectionForm.invalid) return;

    const sectionData = {
      ...this.sectionForm.value,
      order: this.editingSection !== null ? 
        this.sections.at(this.editingSection).value.order :
        this.sections.length
    };

    if (this.editingSection !== null) {
      this.sections.at(this.editingSection).patchValue(sectionData);
    } else {
      this.sections.push(this.fb.group(sectionData));
    }

    this.showSectionDialog = false;
  }

  removeSection(index: number) {
    this.sections.removeAt(index);
    this.reorderSections();
  }

  dropSection(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.sections.controls, event.previousIndex, event.currentIndex);
    this.reorderSections();
  }

  private reorderSections() {
    this.sections.controls.forEach((section, index) => {
      section.patchValue({ order: index });
    });
  }

  cancelSection() {
    this.showSectionDialog = false;
    this.editingSection = null;
  }

  getSectionIcon(type: keyof SectionIcons): string {
    return this.sectionIcons[type] || 'ri-question-line';
  }

  getSectionDescription(section: ReportSection): string {
    switch (section.type) {
      case 'chart':
        return `${section.config.chartType} chart showing ${section.config.metrics?.length} metrics`;
      case 'table':
        return `Table with ${section.config.columns?.length} columns`;
      case 'metrics':
        return `${section.config.metrics?.length} key metrics`;
      case 'summary':
        return 'Text summary section';
      default:
        return '';
    }
  }

  previewReport(): void {
    if (this.templateForm.invalid) return;

    const template: ReportTemplate = this.templateForm.value;
    this.reportService.preview(template).subscribe({
      next: () => {
        this.showPreviewDialog = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate report preview'
        });
      }
    });

    
  }


  saveTemplate(): void {
    if (this.templateForm.invalid) return;

    this.saving = true;
    const templateData: ReportTemplate = {
      ...this.templateForm.value,
      createdBy: 'current-user-id',
      createdAt: new Date()
    };

    const operation = this.templateId ?
      this.reportService.updateTemplate(this.templateId, templateData) :
      this.reportService.createTemplate(templateData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Report template ${this.templateId ? 'updated' : 'created'} successfully`
        });
        this.router.navigate(['/reports/templates']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.templateId ? 'update' : 'create'} report template`
        });
      },
      complete: () => {
        this.saving = false;
      }
    });
  }


  addRecipient(event: any) {
    const email = event.target.value.trim();
    if (email && this.isValidEmail(email)) {
      const recipients = this.schedule.get('recipients');
      recipients?.setValue([...recipients.value, email]);
      event.target.value = '';
    }
    event.preventDefault();
  }
  
  removeRecipient(email: string) {
    const recipients = this.schedule.get('recipients');
    recipients?.setValue(recipients.value.filter((e: string) => e !== email));
  }
  
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

}
