import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.guard';
// import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'patients',
        loadChildren: () => import('./pages/patients/patients.routes')
          .then(m => m.PATIENT_ROUTES)
      },
      {
        path: 'appointments',
        loadChildren: () => import('./pages/appointments/appointments.routes')
          .then(m => m.APPOINTMENT_ROUTES)
      },
      {
        path: 'doctors',
        loadChildren: () => import('./pages/doctors/doctors.routes')
          .then(m => m.DOCTOR_ROUTES)
      },
      {
        path: 'departments',
        loadChildren: () => import('./pages/departments/department.routes')
          .then(m => m.DEPARTMENT_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./pages/inventory/inventory.routes')
          .then(m => m.INVENTORY_ROUTES)
      },
      {
        path: 'billing',
        loadChildren: () => import('./pages/billing/billing.routes')
          .then(m => m.BILLING_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./pages/reports/reports.routes')
          .then(m => m.REPORT_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () => import('./pages/settings/settings.routes')
          .then(m => m.SETTINGS_ROUTES)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      {
        path: 'user-management',
        loadChildren: () => import('./pages/user-management/user-management.route')
          .then(m => m.USER_MANAGEMENT_ROUTES),
        // canActivate: [adminGuard]
      }
    ]
  },

  {
    path: '**',
    loadComponent: () => import('./pages/notfound/notfound.component')
      .then(m => m.NotFoundComponent)
  }
];