import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/billing-dashboard/billing-dashboard.component')
          .then(m => m.BillingDashboardComponent),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/invoice-list/invoice-list.component')
              .then(m => m.InvoiceListComponent),
            data: { breadcrumb: 'Invoices' }
          },
          {
            path: 'create',
            loadComponent: () => import('./components/invoice-form/invoice-form.component')
              .then(m => m.InvoiceFormComponent),
            data: { breadcrumb: 'Create Invoice' }
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/invoice-form/invoice-form.component')
              .then(m => m.InvoiceFormComponent),
            data: { breadcrumb: 'Edit Invoice' }
          },
          // {
          //   path: 'view/:id',
          //   loadComponent: () => import('./components/invoice-details/invoice-details.component')
          //     .then(m => m.InvoiceDetailsComponent),
          //   data: { breadcrumb: 'Invoice Details' }
          // }
        ]
      },
      {
        path: 'payments',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/payment-list/payment-list.component')
              .then(m => m.PaymentListComponent),
            data: { breadcrumb: 'Payments' }
          }
        ]
      }
    ]
  }
];