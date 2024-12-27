import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      {
        path: 'general',
        loadComponent: () => import('./components/general-settings/general-settings.component')
          .then(m => m.GeneralSettingsComponent)
      },
      {
        path: 'hospital',
        loadComponent: () => import('./components/hospital-settings/hospital-settings.component')
          .then(m => m.HospitalSettingsComponent)
      },
      {
        path: 'departments',
        loadComponent: () => import('./components/department-settings/department-settings.component')
          .then(m => m.DepartmentSettingsComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./components/billing-settings/billing-settings.component')
          .then(m => m.BillingSettingsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/notification-settings/notification-settings.component')
          .then(m => m.NotificationSettingsComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./components/security-settings/security-settings.component')
          .then(m => m.SecuritySettingsComponent)
      },
      {
        path: 'integrations',
        loadComponent: () => import('./components/integration-settings/integration-settings.component')
          .then(m => m.IntegrationSettingsComponent)
      }
    ]
  }
];