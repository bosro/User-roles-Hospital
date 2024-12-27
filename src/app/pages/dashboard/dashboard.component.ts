import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, ChartModule, CommonModule, TableModule, SidenavComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  menuItems: MenuItem[] = [];
  stats = [
    { label: 'Total Users', value: '1,234', icon: 'ri-user-line', color: '#4CAF50' },
    { label: 'Active Sessions', value: '56', icon: 'ri-timer-line', color: '#2196F3' },
    { label: 'Failed Logins', value: '12', icon: 'ri-error-warning-line', color: '#F44336' },
    { label: 'System Load', value: '67%', icon: 'ri-cpu-line', color: '#FF9800' }
  ];
  
  chartData: any;
  chartOptions: any;
  recentActivities: any[] = [];

  constructor(private authService: AuthService) {
    this.initializeChartData();
    this.initializeActivities();
  }

  ngOnInit() {
    this.initializeMenu();
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

  private initializeActivities() {
    this.recentActivities = [
      {
        user: 'John Doe',
        action: 'Logged in',
        time: new Date(),
        status: 'Success',
        statusClass: 'bg-green-100 text-green-800'
      },
      // Add more activities
    ];
  }
}
