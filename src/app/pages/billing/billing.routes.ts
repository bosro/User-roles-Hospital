import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/billing-dashboard/billing-dashboard.component')
          .then(m => m.BillingDashboardComponent)
      },
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/invoice-list/invoice-list.component')
              .then(m => m.InvoiceListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./components/invoice-form/invoice-form.component')
              .then(m => m.InvoiceFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/invoice-form/invoice-form.component')
              .then(m => m.InvoiceFormComponent)
          },
          {
            path: 'view/:id',
            loadComponent: () => import('./components/invoice-details/invoice-details.component')
              .then(m => m.InvoiceDetailsComponent)
          }
        ]
      },
      // {
      //   path: 'payments',
      //   loadComponent: () => import('./components/payment-list/payment-list.component')
      //     .then(m => m.PaymentListComponent)
      // },
      // {
      //   path: 'insurance',
      //   loadComponent: () => import('./components/insurance-claims/insurance-claims.component')
      //     .then(m => m.InsuranceClaimsComponent)
      // }
    ]
  }
];