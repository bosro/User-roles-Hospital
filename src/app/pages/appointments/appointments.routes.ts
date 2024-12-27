import { Routes } from '@angular/router';

export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      {
        path: 'calendar',
        loadComponent: () => import('./appointment-calendar/appointment-calendar.component')
          .then(m => m.AppointmentCalendarComponent)
      },
      // {
      //   path: 'list',
      //   loadComponent: () => import('./appointment-list/appointment-list.component')
      //     .then(m => m.AppointmentListComponent)
      // },
      {
        path: 'add',
        loadComponent: () => import('./appointment-form/appointment-form.component')
          .then(m => m.AppointmentFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./appointment-form/appointment-form.component')
          .then(m => m.AppointmentFormComponent)
      },
      {
        path: 'waiting-list',
        loadComponent: () => import('./waiting-list/waiting-list.component')
          .then(m => m.WaitingListComponent)
      }
    ]
  }
];