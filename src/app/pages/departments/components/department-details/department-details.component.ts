import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { TagModule } from "primeng/tag";
import { TimelineModule } from "primeng/timeline";
import { DepartmentService } from "../../services/department.service";
import { MessageService } from "primeng/api";
import { Department } from "../../department.model";

type DepartmentStatus = 'active' | 'inactive' | 'maintenance';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      labels: {
        color: string;
      };
    };
  };
  scales: {
    x: {
      ticks: {
        color: string;
      };
      grid: {
        color: string;
      };
    };
    y: {
      ticks: {
        color: string;
      };
      grid: {
        color: string;
      };
    };
  };
}

@Component({
  selector: 'app-department-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    TagModule,
    ChartModule,
    TableModule,
    TimelineModule,
    AvatarModule
  ],
  templateUrl: 'department-details.component.html'
})
export class DepartmentDetailsComponent implements OnInit {
  department: Department | null = null;
  departmentStaff: any[] = [];
  patientFlowData: any;
  resourceUtilizationData: any;
  chartOptions!: ChartOptions;

  private readonly statusSeverityMap: Record<DepartmentStatus, TagSeverity> = {
    'active': 'success',
    'inactive': 'danger',
    'maintenance': 'warn'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private messageService: MessageService
  ) {
    this.initializeChartOptions();
  }

  ngOnInit() {
    this.loadDepartment();
  }

  private loadDepartment() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.departmentService.getDepartmentById(id).subscribe({
        next: (department) => {
          this.department = department;
          this.loadDepartmentStaff();
          this.updateChartData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load department details'
          });
        }
      });
    }
  }

  private loadDepartmentStaff() {
    // Load department staff implementation
  }

  private initializeChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  private updateChartData() {
    // Update chart data
  }

  getStatusSeverity(status: string | undefined): TagSeverity {
    if (!status) return 'info';
    return this.statusSeverityMap[status as DepartmentStatus] || 'info';
  }

  formatWorkingDays(days: string[] | undefined): string {
    if (!days) return '';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  }

  getOccupancyRate(): number {
    if (!this.department?.capacity) return 0;
    return Math.round(
      (this.department.capacity.currentOccupancy / this.department.capacity.beds) * 100
    );
  }

  getTotalStaff(): number {
    if (!this.department?.staff) return 0;
    return Object.values(this.department.staff).reduce((a, b) => a + b, 0);
  }

  getBudgetUtilization(): number {
    if (!this.department?.budget) return 0;
    return Math.round(
      (this.department.budget.utilized / this.department.budget.allocated) * 100
    );
  }

  getBudgetUtilizationClass(): string {
    const utilization = this.getBudgetUtilization();
    if (utilization > 90) return 'bg-red-500';
    if (utilization > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  editDepartment() {
    if (!this.department?.id) return;
    this.router.navigate(['../edit', this.department.id], { relativeTo: this.route });
  }
}