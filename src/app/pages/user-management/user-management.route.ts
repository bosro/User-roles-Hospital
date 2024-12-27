
import { Routes } from '@angular/router';

export const USER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/user-management/user-management.component')
          .then(m => m.UserManagementComponent)
      },
      {
        path: 'audit-log',
        loadComponent: () => import('./components/audit-log/audit-log.component')
          .then(m => m.AuditLogComponent)
      },
      {
        path: 'permissions',
        loadComponent: () => import('./components/permission-management/permission-management.component')
          .then(m => m.PermissionManagementComponent)
      },
      {
        path: 'sessions',
        loadComponent: () => import('./components/session-management/session-management.component')
          .then(m => m.SessionManagementComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./components/user-form/user-form.component')
          .then(m => m.UserFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/user-form/user-form.component')
          .then(m => m.UserFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/user-view-dialog/user-view-dialog.component')
          .then(m => m.UserViewDialogComponent)
      }
    ]
  }
];