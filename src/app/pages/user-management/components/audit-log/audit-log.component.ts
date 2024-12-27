import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

interface AuditLog {
  timestamp: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  action: string;
  details: string;
  ipAddress: string;
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    AvatarModule,
    DatePickerModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    SelectModule,
    CardModule,
    TableModule,
  ],
  templateUrl: 'audit-log.component.html',
})
export class AuditLogComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  loading = false;
  today = new Date();
  dateRange: Date[] = [];
  selectedActionType: string | null = null;

  actionTypes = [
    { label: 'Login', value: 'login' },
    { label: 'Logout', value: 'logout' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
  ];

  ngOnInit() {
    this.loadAuditLogs();
  }

  getUserInitials(user: AuditLog['user']): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }

  getActionClass(action: string): string {
    const classes: { [key: string]: string } = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      create: 'bg-blue-100 text-blue-800',
      update: 'bg-orange-100 text-orange-800',
      delete: 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${
      classes[action.toLowerCase()] || ''
    }`;
  }

  exportLog() {
    // Implementation
    const data = this.auditLogs.map((log) => ({
      timestamp: log.timestamp,
      user: `${log.user.firstName} ${log.user.lastName}`,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
    }));

    // Export logic here
  }

  private loadAuditLogs() {
    this.loading = true;
    // Implement API call to load audit logs
    this.loading = false;
  }
}
