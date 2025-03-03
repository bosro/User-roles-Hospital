// src/app/pages/departments/components/department-list/department-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Department } from '../../department.model';
import { DepartmentService } from '../../services/department.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';

type DepartmentStatus = 'active' | 'inactive' | 'maintenance';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface DepartmentStats {
  totalDepartments: number;
  totalPatients: number;
  totalStaff: number;
  occupancyRate: number;
}

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TagModule,
    ChartModule,
    DialogModule,
    ConfirmDialogModule,
    TabViewModule,
    InputTextModule,
    TooltipModule,
    DividerModule,
    AvatarModule,
    BadgeModule,
    SkeletonModule
  ],
  templateUrl: 'department-list.component.html',
  styles: [`
    /* Improving table hover states */
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background-color: #f1f5f9;
    }
    
    /* Style enhancements for cards */
    :host ::ng-deep .p-card {
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }
    
    :host ::ng-deep .p-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    /* Custom styling for tabs in modal */
    .department-details ::ng-deep .p-tabview-nav {
      border-color: #e5e7eb;
      border-radius: 0.5rem;
      background-color: #f9fafb;
      padding: 0.25rem;
    }
    
    .department-details ::ng-deep .p-tabview-nav li .p-tabview-nav-link {
      padding: 0.75rem 1rem;
      font-weight: 500;
      border-radius: 0.375rem;
      transition: background-color 0.2s, color 0.2s, border-color 0.2s;
    }
    
    .department-details ::ng-deep .p-tabview-nav li .p-tabview-nav-link:not(.p-disabled):focus {
      box-shadow: none;
    }
    
    .department-details ::ng-deep .p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link {
      background-color: #f3f4f6;
      border-color: #e5e7eb;
    }
    
    .department-details ::ng-deep .p-tabview-panels {
      padding: 1.5rem;
      background-color: #f9fafb;
      border-radius: 0.5rem;
    }
  `]
})
export class DepartmentListComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  departments: Department[] = [];
  loading = false;
  displayDetailModal = false;
  selectedDepartment: Department | null = null;
  
  stats: DepartmentStats = {
    totalDepartments: 0,
    totalPatients: 0,
    totalStaff: 0,
    occupancyRate: 0
  };

  private readonly statusSeverityMap: Record<DepartmentStatus, TagSeverity> = {
    'active': 'success',
    'inactive': 'danger',
    'maintenance': 'warn'
  };

  constructor(
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data.map(dept => ({
          ...dept,
          // Add missing properties for UI display
          status: this.getDepartmentStatus(dept),
          staff: {
            doctors: Math.floor(dept.capacity.staffCount * 0.4),
            nurses: Math.floor(dept.capacity.staffCount * 0.4),
            support: Math.floor(dept.capacity.staffCount * 0.2)
          },
          capacity: {
            ...dept.capacity,
            beds: dept.capacity.totalBeds
          },
          headOfDepartment: {
            name: this.getHeadName(dept.headOfDepartment),
            email: dept.contactInfo?.email || dept.email
          },
          stats: {
            patientCount: dept.capacity.currentOccupancy,
            satisfactionRate: Math.floor(Math.random() * 20) + 80 // Random value for demo
          },
          budget: {
            allocated: Math.floor(Math.random() * 500000) + 500000,
            utilized: Math.floor(Math.random() * 400000) + 300000
          },
          id: dept._id
        }));
        
        this.updateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments'
        });
        this.loading = false;
      }
    });
  }

  // Helper method to get department head name
  private getHeadName(headId: string): string {
    // This would typically come from your API
    // For now, return a placeholder
    return headId ? 'Dr. ' + headId.substring(0, 8) : 'Not Assigned';
  }

  // Helper method to determine department status
  private getDepartmentStatus(dept: any): DepartmentStatus {
    // Logic to determine department status
    // For demo, return based on occupancy
    const occupancyRate = (dept.capacity.currentOccupancy / dept.capacity.totalBeds) * 100;
    if (occupancyRate > 90) return 'maintenance';
    if (occupancyRate < 30) return 'inactive';
    return 'active';
  }

  updateStats() {
    this.stats.totalDepartments = this.departments.length;
    this.stats.totalPatients = this.departments.reduce((sum, dept) => 
      sum + (dept.stats?.patientCount ?? 0), 0);
    this.stats.totalStaff = this.departments.reduce((sum, dept) => 
      sum + (dept.staff ? Object.values(dept.staff).reduce((a: number, b: number) => a + b, 0) : 0), 0);
    this.stats.occupancyRate = this.getAverageOccupancy();
  }

  getStatusSeverity(status: string): TagSeverity {
    return this.statusSeverityMap[status as DepartmentStatus] || 'info';
  }

  getStatusLabel(status: string): string {
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getOccupancyRate(department: Department): number {
    return Math.round((department.capacity.currentOccupancy / (department.capacity.beds ?? 1)) * 100);
  }

  getAverageOccupancy(): number {
    if (this.departments.length === 0) return 0;
    const total = this.departments.reduce((sum, dept) => 
      sum + this.getOccupancyRate(dept), 0);
    return Math.round(total / this.departments.length);
  }

  onSearch(event: Event) {
    const element = event.target as HTMLInputElement;
    this.table.filterGlobal(element.value, 'contains');
  }

  viewDetails(department: Department) {
    this.selectedDepartment = department;
    this.displayDetailModal = true;
  }

  editDepartment(department: Department) {
    this.router.navigate(['/departments/edit', department.id]);
  }

  confirmDelete(department: Department) {
    this.confirmationService.confirm({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete the ${department.name} department?`,
      icon: 'ri-error-warning-line',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger p-button-rounded',
      rejectButtonStyleClass: 'p-button-secondary p-button-rounded',
      accept: () => {
        this.deleteDepartment(department);
      }
    });
  }

  private deleteDepartment(department: Department) {
    if (!department.id) return;
    
    this.departmentService.deleteDepartment(department.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Department deleted successfully'
        });
        this.loadDepartments();
      },
      error: (err) => {
        console.error('Error deleting department:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete department'
        });
      }
    });
  }

  exportData() {
    // Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Department data exported'
    });
  }

  closeModal() {
    this.displayDetailModal = false;
    this.selectedDepartment = null;
  }

  // Get day names in a readable format
  formatWorkingDays(days: string[]): string {
    if (!days || days.length === 0) return 'Not specified';
    if (days.length === 5 && 
        days.includes('Monday') && 
        days.includes('Tuesday') && 
        days.includes('Wednesday') && 
        days.includes('Thursday') && 
        days.includes('Friday')) {
      return 'Monday to Friday';
    }
    if (days.length === 7) return 'All days';
    return days.join(', ');
  }

  // Format time range
  formatWorkingHours(start?: string, end?: string): string {
    if (!start || !end) return 'Not specified';
    return `${start} - ${end}`;
  }
  
  getBudgetUtilization(department: Department): number {
    if (!department?.budget) return 0;
    return Math.round(
      (department.budget.utilized / department.budget.allocated) * 100
    );
  }

  getBudgetUtilizationClass(utilization: number): string {
    if (utilization > 90) return 'bg-red-500';
    if (utilization > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}