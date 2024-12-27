// src/app/pages/billing/components/billing-dashboard/billing-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { BillingService } from '../../services/billing.service';
import { Invoice } from '../../billing.model';

type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

interface BillingStats {
  totalRevenue: number;
  pendingInvoices: number;
  outstandingAmount: number;
  collectionRate: number;
  insurance: InsuranceStats;
}

interface InsuranceStats {
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
}

interface BillingTrends {
  months: string[];
  revenue: number[];
  collections: number[];
  paymentDistribution: number[];
}

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TableModule,
    ProgressBarModule
  ],
  templateUrl: 'billing-dashboard.component.html'

})

export class BillingDashboardComponent implements OnInit {
  stats: BillingStats = {
    totalRevenue: 0,
    pendingInvoices: 0,
    outstandingAmount: 0,
    collectionRate: 0,
    insurance: {
      pendingCount: 0,
      pendingAmount: 0,
      approvedCount: 0,
      approvedAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0
    }
  };

  insuranceStats: InsuranceStats = {
    pendingCount: 0,
    pendingAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    rejectedCount: 0,
    rejectedAmount: 0
  };

  recentInvoices: Invoice[] = [];
  upcomingPayments: (Invoice & { daysLeft: number })[] = [];
  revenueChartData: any;
  paymentDistributionData: any;
  revenueChartOptions: any;
  doughnutChartOptions: any;

  private readonly statusClasses: Record<InvoiceStatus, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };


  constructor(private billingService: BillingService) {
    this.initializeCharts();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.billingService.getBillingStats().subscribe({
      next: (stats: BillingStats) => {
        this.stats = stats;
        this.insuranceStats = stats.insurance;
      }
    });

    this.billingService.getBillingTrends().subscribe({
      next: (trends: BillingTrends) => {
        this.updateChartData(trends);
      }
    });

    this.loadRecentInvoices();
    this.loadUpcomingPayments();
  }


  private initializeCharts() {
    this.revenueChartOptions = {
      plugins: {
        legend: {
          labels: { usePointStyle: true }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => `$${value}`
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    this.doughnutChartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  private updateChartData(trends: BillingTrends) {
    this.revenueChartData = {
      labels: trends.months,
      datasets: [
        {
          label: 'Revenue',
          data: trends.revenue,
          borderColor: '#4CAF50',
          tension: 0.4
        },
        {
          label: 'Collections',
          data: trends.collections,
          borderColor: '#2196F3',
          tension: 0.4
        }
      ]
    };

    this.paymentDistributionData = {
      labels: ['Cash', 'Card', 'Insurance', 'Bank Transfer'],
      datasets: [{
        data: trends.paymentDistribution,
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
      }]
    };
  }


  private loadRecentInvoices() {
    this.billingService.getInvoices({ limit: 5, sort: 'dateIssued:desc' })
      .subscribe({
        next: (invoices) => {
          this.recentInvoices = invoices;
        }
      });
  }

  private loadUpcomingPayments() {
    this.billingService.getInvoices({ 
      status: 'pending', 
      limit: 5, 
      sort: 'dueDate:asc' 
    }).subscribe({
      next: (invoices) => {
        this.upcomingPayments = invoices.map(invoice => ({
          ...invoice,
          daysLeft: this.calculateDaysLeft(invoice.dueDate)
        }));
      }
    });
  }


  getStatusClass(status: string): string {
    return status in this.statusClasses 
      ? `px-2 py-1 rounded-full text-xs font-medium ${this.statusClasses[status as InvoiceStatus]}`
      : 'px-2 py-1 rounded-full text-xs font-medium';
  }

  getDaysLeftClass(days: number): string {
    if (days <= 0) return 'text-red-600 font-medium';
    if (days <= 3) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
  }

  private calculateDaysLeft(dueDate: Date): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

}
