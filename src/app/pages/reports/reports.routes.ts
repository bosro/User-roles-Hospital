// src/app/pages/reports/reports.routes.ts
import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/report-dashboard/report-dashboard.component')
          .then(m => m.ReportsDashboardComponent)
      },
      {
        path: 'financial',
        loadComponent: () => import('./components/financial-reports/financial-reports.component')
          .then(m => m.FinancialReportsComponent)
      },
      {
        path: 'template',
        loadComponent: () => import('./components/report-template/report-template.component')
          .then(m => m.ReportTemplatesComponent)
      },
      {
        path: 'preview',
        loadComponent: () => import('./components/report-preview/report-preview.component')
          .then(m => m.ReportPreviewComponent)
      },
      {
        path: 'builder',
        loadComponent: () => import('./components/report-builder/report-builder.component')
          .then(m => m.ReportBuilderComponent)
      },
      {
        path: 'patient',
        loadComponent: () => import('./components/patient-report/patient-report.component')
          .then(m => m.PatientReportsComponent)
      },
      {
        path: 'department',
        loadComponent: () => import('./components/department-reports/department-reports.component')
          .then(m => m.DepartmentReportsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./components/inventory-reports/inventory-reports.component')
          .then(m => m.InventoryReportsComponent)
      }
    ]
  }
];
