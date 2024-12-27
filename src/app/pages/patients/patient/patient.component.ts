import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    TabMenuModule
  ],
  template: `
    <div class="p-4">
      <p-tabMenu [model]="menuItems" [activeItem]="activeItem"></p-tabMenu>
      <div class="mt-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class PatientComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      label: 'Patient List',
      icon: 'ri-list-unordered',
      routerLink: '/patients/list'
    },
    {
      label: 'Add Patient',
      icon: 'ri-user-add-line',
      routerLink: '/patients/add'
    },
    {
      label: 'Analytics',
      icon: 'ri-bar-chart-line',
      routerLink: '/patients/analytics'
    }
  ];

  activeItem: MenuItem | undefined;

  constructor() {}

  ngOnInit() {
    // Set the active menu item based on the current route
    const currentPath = window.location.pathname;
    this.activeItem = this.menuItems.find(item => 
      item.routerLink && currentPath.includes(item.routerLink)
    );
  }
}