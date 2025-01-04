import { Routes } from '@angular/router';

export const USER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        redirectTo: 'users', 
        pathMatch: 'full' 
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/user-management/user-management.component')
              .then(m => m.UserManagementComponent),
            data: { breadcrumb: 'Users' }
          },
          {
            path: 'add',
            loadComponent: () => import('./components/user-form/user-form.component')
              .then(m => m.UserFormComponent),
            data: { breadcrumb: 'Add User' }
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/user-form/user-form.component')
              .then(m => m.UserFormComponent),
            data: { breadcrumb: 'Edit User' }
          },
          {
            path: 'view/:id',
            loadComponent: () => import('./components/user-view-dialog/user-view.component')
              .then(m => m.UserViewComponent),
            data: { breadcrumb: 'User Details' }
          },
          {
            path: 'bulk-actions',
            loadComponent: () => import('./components/bulk-actions/bulk-actions.component')
              .then(m => m.BulkActionsComponent),
            data: { breadcrumb: 'Bulk Actions' }
          }
        ]
      },
      {
        path: 'permissions',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/permission-management/permission-management.component')
              .then(m => m.PermissionManagementComponent),
            data: { breadcrumb: 'Permissions' }
          }
        ]
      },
      {
        path: 'sessions',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/session-management/session-management.component')
              .then(m => m.SessionManagementComponent),
            data: { breadcrumb: 'Active Sessions' }
          }
        ]
      },
      {
        path: 'audit-log',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/audit-log/audit-log.component')
              .then(m => m.AuditLogComponent),
            data: { breadcrumb: 'Audit Log' }
          }
        ]
      }
    ]
  }
];