import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./inventory-dashboard/inventory-dashboard.component')
          .then(m => m.InventoryDashboardComponent)
      },
      {
        path: 'medicines',
        loadComponent: () => import('./components/medicines/medicine-list/medicine-list.component')
          .then(m => m.MedicinesListComponent)
      },
      {
        path: 'medicines/add',
        loadComponent: () => import('./components/medicines/medicine-form/medicine-form.component')
          .then(m => m.MedicineFormComponent)
      },
      {
        path: 'medicines/edit/:id',
        loadComponent: () => import('./components/medicines/medicine-form/medicine-form.component')
          .then(m => m.MedicineFormComponent)
      },
      {
        path: 'equipment',
        loadComponent: () => import('./components/equipments/equipment-list/equipment-list.component')
          .then(m => m.EquipmentListComponent)
      },
      {
        path: 'supplies',
        loadComponent: () => import('./components/supplies/supplies-list/supplies-list.component')
          .then(m => m.SuppliesListComponent)
      }
    ]
  }
];
