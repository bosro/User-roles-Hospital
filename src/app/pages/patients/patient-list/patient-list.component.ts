import { MessageService } from 'primeng/api';
import { PatientService } from '../services/patient.service';
import { Component, OnInit } from '@angular/core';
import { Patient } from '../models/patients.model';
import { Card } from 'primeng/card';
import { Table, TableModule } from 'primeng/table';
import { Avatar } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { Calendar } from 'primeng/calendar';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownModule } from "primeng/dropdown";

interface Filters {
  search: string;
  dateRange: Date[] | null;
  bloodGroup: string | null;
  status: string | null;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    Card,
    TableModule,
    Avatar,
    FormsModule,
    Calendar,
    Tag,
    Button,
    CommonModule,
    RouterModule,
    DropdownModule,
  ],
  templateUrl: 'patient-list.component.html',
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  today = new Date();

  stats = {
    totalPatients: 0,
    todayAppointments: 0,
    newPatients: 0,
    activePatients: 0,
  };

  filters: Filters = {
    search: '',
    dateRange: null,
    bloodGroup: null,
    status: null,
  };

  bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
  ];

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'New', value: 'new' },
  ];

  constructor(
    private patientService: PatientService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadStats();
  }

  loadPatients(): void {
    this.loading = true;
    const params = this.getFilterParams();

    this.patientService.getPatients(params).subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patients',
        });
        this.loading = false;
      },
    });
  }

  private loadStats() {
    // Implement stats loading logic
  }

  private getFilterParams(): any {
    const params: any = {};

    if (this.filters.search) {
      params.search = this.filters.search;
    }

    if (
      this.filters.dateRange &&
      this.filters.dateRange[0] &&
      this.filters.dateRange[1]
    ) {
      params.startDate = this.filters.dateRange[0].toISOString();
      params.endDate = this.filters.dateRange[1].toISOString();
    }

    if (this.filters.bloodGroup) {
      params.bloodGroup = this.filters.bloodGroup;
    }

    if (this.filters.status) {
      params.status = this.filters.status;
    }

    return params;
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value.length >= 3 || target.value.length === 0) {
      this.loadPatients();
    }
  }

  filterPatients() {
    this.loadPatients();
  }

  getInitials(patient: Patient): string {
    return `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`;
  }

  calculateAge(dob: string): number {
    return Math.floor(
      (new Date().getTime() - new Date(dob).getTime()) / 31557600000
    );
  }

  getTimeSince(date: string): string {
    const days = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 86400000
    );
    return `${days} days ago`;
  }

  getStatusSeverity(
    status: string
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      active: 'success',
      inactive: 'danger',
      new: 'info',
      pending: 'warn',
    };
    return severities[status] || 'secondary';
  }

  getBloodGroupColor(bloodGroup: string): string {
    const colors: Record<string, string> = {
      'A+': '#e3f2fd',
      'A-': '#e8eaf6',
      'B+': '#f3e5f5',
      'B-': '#fce4ec',
      'AB+': '#f1f8e9',
      'AB-': '#fff3e0',
      'O+': '#e0f2f1',
      'O-': '#fff8e1',
    };
    return colors[bloodGroup] || '#f5f5f5';
  }

  getAvatarColor(id: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const index = parseInt(id.substring(id.length - 2), 16) % colors.length;
    return colors[index];
  }
}
