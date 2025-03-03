import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { HeaderComponent } from '../../components/header/header.component';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, ChartModule, CommonModule, TableModule, SidenavComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
[x: string]: any;
  menuItems: MenuItem[] = [];
  stats: any[] = [];
  chartData: any;
  chartOptions: any;
  recentPatients: any[] = [];
  recentActivities: any[] = [];

  constructor(private authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit() {
    this.initializeMenu();
    this.loadDashboardData();
  }

  private initializeMenu() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'ri-dashboard-line',
        routerLink: ['/']
      },
      {
        label: 'User Management',
        icon: 'ri-user-settings-line',
        routerLink: ['/user-management'],
        visible: this.authService.currentUserValue?.role === 'admin'
      },
      // Add more menu items
    ];
  }

  private loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe(data => {
      this.stats = [
        { label: 'Total Patients', value: data.totalPatients, icon: 'ri-user-line', color: '#4CAF50' },
        { label: 'Admitted Patients', value: data.admittedPatients, icon: 'ri-hospital-line', color: '#2196F3' },
        { label: 'Chronic Patients', value: data.chronicPatients, icon: 'ri-heart-pulse-line', color: '#F44336' }
      ];
      this.recentPatients = data.recentPatients;
      this.initializeChartData();
    });
  }

  private initializeChartData() {
    this.chartData = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        {
          label: 'System Activity',
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: '#4CAF50'
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }
}