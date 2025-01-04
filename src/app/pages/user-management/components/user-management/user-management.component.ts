import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TimelineModule } from 'primeng/timeline';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';
import { DialogService } from 'primeng/dynamicdialog';
import { PasswordResetDialogComponent } from '../password-reset-dialog/password-reset-dialog.component';
import { ImportUsersDialogComponent } from '../import-users-dialog/import-users-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    MultiSelectModule,
    ToastModule,
    ConfirmDialogModule,
    AvatarModule,
    TagModule,
    TimelineModule,
    TooltipModule,
    FormsModule,
  ],
  providers:[DialogService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  loading = false;

  displayUserDialog = false;
  displayImportDialog = false;
  displayViewDialog = false;
  displayResetDialog = false;

  filters: {
    search: string;
    role: string | null;
    department: string | null;
    status: string | null;
  } = {
    search: '',
    role: null,
    department: null,
    status: null,
  };

  userStats = {
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    onlineUsers: 0,
  };

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Nurse', value: 'nurse' },
    { label: 'Staff', value: 'staff' },
    { label: 'Receptionist', value: 'receptionist' },
  ];

  departments = [
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' },
    { label: 'Orthopedics', value: 'orthopedics' },
  ];

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' },
  ];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.updateStats();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers(this.filters).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
        this.loading = false;
      },
    });
  }

  updateStats() {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
    });
  }

  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }

  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      staff: 'bg-orange-100 text-orange-800',
      receptionist: 'bg-gray-100 text-gray-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[role] || ''}`;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${
      classes[status] || ''
    }`;
  }

  onSearch(event: Event) {
    this.filterUsers();
  }

  filterUsers() {
    this.loadUsers();
  }

  showUserDialog() {
    this.selectedUser = null;
    this.displayUserDialog = true;
  }

  showImportDialog() {
    this.displayImportDialog = true;
  }

  viewUser(user: User) {
    this.selectedUser = user;
    this.displayViewDialog = true;
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.displayUserDialog = true;
  }

  resetPassword(user: User) {
    this.selectedUser = user;
    this.displayResetDialog = true;
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const message = `Are you sure you want to ${
      newStatus === 'blocked' ? 'block' : 'activate'
    } this user?`;

    this.confirmationService.confirm({
      message,
      accept: () => {
        this.userService.updateUserStatus(user.id, newStatus).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `User ${
                newStatus === 'blocked' ? 'blocked' : 'activated'
              } successfully`,
            });
            this.loadUsers();
            this.updateStats();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update user status',
            });
          },
        });
      },
    });
  }

  openPasswordResetDialog(user: User) {
    this.dialogService.open(PasswordResetDialogComponent, {
      header: `Reset Password - ${user.firstName}`,
      width: '400px',
      data: { user },
    });
  }

  openImportUsersDialog() {
    this.dialogService.open(ImportUsersDialogComponent, {
      header: 'Import Users',
      width: '500px',
    });
  }
}
