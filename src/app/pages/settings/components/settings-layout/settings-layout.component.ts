import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CardModule } from "primeng/card";
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TabsModule
  ],
  templateUrl: './settings-layout.component.html'
})
export class SettingsLayoutComponent {
  navigationItems = [
    { label: 'General', icon: 'ri-settings-line', route: './general' },
    { label: 'Hospital Profile', icon: 'ri-hospital-line', route: './hospital' },
    { label: 'Departments', icon: 'ri-building-2-line', route: './departments' },
    { label: 'Billing & Payments', icon: 'ri-money-dollar-circle-line', route: './billing' },
    { label: 'Notifications', icon: 'ri-notification-line', route: './notifications' },
    { label: 'Security', icon: 'ri-shield-keyhole-line', route: './security' },
    { label: 'Integrations', icon: 'ri-plug-line', route: './integrations' }
  ];
}