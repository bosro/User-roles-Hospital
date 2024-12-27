import { Routes } from '@angular/router';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./components/department-list/department-list.component')
          .then(m => m.DepartmentListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./components/department-form/department-form.component')
          .then(m => m.DepartmentFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/department-form/department-form.component')
          .then(m => m.DepartmentFormComponent)
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./components/department-details/department-details.component')
          .then(m => m.DepartmentDetailsComponent)
      }
    ]
  }
];
