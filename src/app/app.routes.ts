import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.guard';
import { RoleGuard } from './guards/role-guard.guard';
// import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard], // Only AuthGuard at the parent level
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./pages/patients/patients.routes').then(
            (m) => m.PATIENT_ROUTES
          ),
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'doctor'] }, // Allow only admins and doctors
      },
      {
        path: 'appointments',
        loadChildren: () =>
          import('./pages/appointments/appointments.routes').then(
            (m) => m.APPOINTMENT_ROUTES
          ),
        canActivate: [RoleGuard],
        data: { roles: ['doctor', 'nurse'] }, // Allow doctors and nurses
      },
      {
        path: 'doctors',
        loadChildren: () =>
          import('./pages/doctors/doctors.routes').then((m) => m.DOCTOR_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }, // Admin-only access
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./pages/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES
          ),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }, // Admin-only access
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./pages/user-management/user-management.route').then(
            (m) => m.USER_MANAGEMENT_ROUTES
          ),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }, // Admin-only access
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/notfound/notfound.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
