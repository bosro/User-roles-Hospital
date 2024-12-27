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
import { Department } from '../../department.model';
import { DepartmentService } from '../../services/department.service';
import { ConfirmationService, MessageService } from 'primeng/api';


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
    ChartModule
  ],
  templateUrl: 'department-list.component.html'
})
export class DepartmentListComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  departments: Department[] = [];
  loading = false;
  
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
        this.departments = data;
        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments'
        });
        this.loading = false;
      }
    });
  }


  updateStats() {
    this.stats.totalDepartments = this.departments.length;
    this.stats.totalPatients = this.departments.reduce((sum, dept) => 
      sum + dept.stats.patientCount, 0);
    this.stats.totalStaff = this.departments.reduce((sum, dept) => 
      sum + Object.values(dept.staff).reduce((a, b) => a + b, 0), 0);
    this.stats.occupancyRate = this.getAverageOccupancy();
  }

  getStatusSeverity(status: string): TagSeverity {
    return this.statusSeverityMap[status as DepartmentStatus] || 'info';
  }

  getOccupancyRate(department: Department): number {
    return Math.round((department.capacity.currentOccupancy / department.capacity.beds) * 100);
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
    this.router.navigate(['details', department.id], { relativeTo: this.route });
  }

  editDepartment(department: Department) {
    this.router.navigate(['edit', department.id], { relativeTo: this.route });
  }

  confirmDelete(department: Department) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${department.name}?`,
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
      error: () => {
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
  }
}
