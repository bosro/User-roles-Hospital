import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./inventory-dashboard/inventory-dashboard.component')
          .then(m => m.InventoryDashboardComponent),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'medicines',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/medicines/medicine-list/medicine-list.component')
              .then(m => m.MedicinesListComponent),
            data: { breadcrumb: 'Medicines' }
          },
          {
            path: 'add',
            loadComponent: () => import('./components/medicines/medicine-form/medicine-form.component')
              .then(m => m.MedicineFormComponent),
            data: { breadcrumb: 'Add Medicine' }
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/medicines/medicine-form/medicine-form.component')
              .then(m => m.MedicineFormComponent),
            data: { breadcrumb: 'Edit Medicine' }
          },
          {
            path: 'view/:id',
            loadComponent: () => import('./components/medicines/medicine-details/medicine-details.component')
              .then(m => m.MedicineDetailsComponent),
            data: { breadcrumb: 'Medicine Details' }
          }
        ]
      },
      {
        path: 'equipment',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/equipments/equipment-list/equipment-list.component')
              .then(m => m.EquipmentListComponent),
            data: { breadcrumb: 'Equipment' }
          },
          {
            path: 'add',
            loadComponent: () => import('./components/equipments/equipment-form/equipment-form.component')
              .then(m => m.EquipmentFormComponent),
            data: { breadcrumb: 'Add Equipment' }
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/equipments/equipment-form/equipment-form.component')
              .then(m => m.EquipmentFormComponent),
            data: { breadcrumb: 'Edit Equipment' }
          },
          {
            path: 'view/:id',
            loadComponent: () => import('./components/equipments/equipment-details/equipment-details.component')
              .then(m => m.EquipmentDetailsComponent),
            data: { breadcrumb: 'Equipment Details' }
          }
        ]
      },
      {
        path: 'supplies',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/supplies/supplies-list/supplies-list.component')
              .then(m => m.SuppliesListComponent),
            data: { breadcrumb: 'Supplies' }
          },
          {
            path: 'add',
            loadComponent: () => import('./components/supplies/supplies-form/supplies-form.component')
              .then(m => m.SuppliesFormComponent),
            data: { breadcrumb: 'Add Supply' }
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/supplies/supplies-form/supplies-form.component')
              .then(m => m.SuppliesFormComponent),
            data: { breadcrumb: 'Edit Supply' }
          },
          {
            path: 'view/:id',
            loadComponent: () => import('./components/supplies/supplies-details/supplies-details.component')
              .then(m => m.SuppliesDetailsComponent),
            data: { breadcrumb: 'Supply Details' }
          }
        ]
      }
    ]
  }
];