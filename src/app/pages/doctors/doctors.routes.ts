import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./components/doctors-list/doctors-list.component')
          .then(m => m.DoctorListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./components/doctor-form/doctor-form.component')
          .then(m => m.DoctorFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/doctor-form/doctor-form.component')
          .then(m => m.DoctorFormComponent)
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./components/doctor-profile/doctor-profile.component')
          .then(m => m.DoctorProfileComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./components/doctor-schedule/doctor-schedule.component')
          .then(m => m.DoctorScheduleComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./components/patient-history/patient-history.component')
          .then(m => m.PatientHistoryComponent)
      },
    ]
  }
];