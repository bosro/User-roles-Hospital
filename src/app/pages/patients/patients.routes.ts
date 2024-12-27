import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list',
        loadComponent: () => import('./patient-list/patient-list.component')
          .then(m => m.PatientListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./patient-form/patient-form.component')
          .then(m => m.PatientFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./patient-form/patient-form.component')
          .then(m => m.PatientFormComponent)
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./patient-profile/patient-profile.component')
          .then(m => m.PatientProfileComponent)
      },
      {
        path: 'patient',
        loadComponent: () => import('./patient/patient.component')
          .then(m => m.PatientComponent)
      },
      // {
      //   path: 'appointments/:id',
      //   loadComponent: () => import('./components/patient-appointments/patient-appointments.component')
      //     .then(m => m.PatientAppointmentsComponent)
      // }
    ]
  }
];