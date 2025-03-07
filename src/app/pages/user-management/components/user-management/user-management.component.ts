import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { DialogService } from 'primeng/dynamicdialog';
import { PasswordResetDialogComponent } from '../password-reset-dialog/password-reset-dialog.component';
import { ImportUsersDialogComponent } from '../import-users-dialog/import-users-dialog.component';
import { FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

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
    FileUploadModule,
    PasswordModule,
    DividerModule
  ],
  providers: [DialogService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  selectedUser: any | null = null;
  loading = false;

  displayUserDialog = false;
  displayImportDialog = false;
  displayViewDialog = false;
  displayResetDialog = false;

  // Form groups
  userForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  // Import file handling
  selectedFile: File | null = null;
  selectedFileName: string = '';
  uploadedPreview: any[] = [];

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

  // User blocking status
  blockingUser = false;
  unblockingUser = false;

  roles = [
    { label: 'SUPER ADMIN', value: 'SUPER_ADMIN' },
    { label: 'ADMINISTRATOR', value: 'ADMINISTRATOR' },
    { label: 'DOCTOR', value: 'DOCTOR' },
    { label: 'NURSE', value: 'NURSE' },
    { label: 'PHYSICIAN ASSISTANT', value: 'PHYSICIAN_ASSISTANT' },
    { label: 'PATIENT', value: 'PATIENT' },
    { label: 'RECEPTIONIST', value: 'RECEPTIONIST' },
    { label: 'PHARMACIST', value: 'PHARMACIST' },
    { label: 'LAB TECHNICIAN', value: 'LAB_TECHNICIAN' },
    { label: 'BILLING STAFF', value: 'BILLING_STAFF' },
    { label: 'RADIOLOGIST', value: 'RADIOLOGIST' },
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

  languageOptions = [
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Arabic', code: 'ar' },
  ];

  workingDaysOptions = [
    { name: 'Monday', code: 'MON' },
    { name: 'Tuesday', code: 'TUE' },
    { name: 'Wednesday', code: 'WED' },
    { name: 'Thursday', code: 'THU' },
    { name: 'Friday', code: 'FRI' },
    { name: 'Saturday', code: 'SAT' },
    { name: 'Sunday', code: 'SUN' },
  ];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.updateStats();
    this.initForms();
  }

  initForms() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['STAFF', Validators.required],
      department: ['', Validators.required],
      languages: [[]],
      workingDays: [[]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatched: true };
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers(this.filters).subscribe({
      next: (response) => {
        // Map backend data to our component's format
        this.users = response.data.map((user: any) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department || 'N/A',
          status: user.available ? 'active' : 'blocked',
          lastLogin: new Date(user.lastLogin || user.createdAt),
          profileImage: user.profilePhoto,
          languages: user.languages || [],
          workingDays: user.workingDays || [],
          createdAt: user.createdAt,
          // Keep all original properties too
          ...user
        }));
        
        // Update stats
        this.userStats.totalUsers = this.users.length;
        this.userStats.activeUsers = this.users.filter(u => u.available || u.status === 'active').length;
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
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
      error: (err) => {
        console.error('Failed to load user stats:', err);
      }
    });
  }

  getUserInitials(user: any): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }

  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
      'ADMINISTRATOR': 'bg-purple-100 text-purple-800',
      'DOCTOR': 'bg-blue-100 text-blue-800',
      'NURSE': 'bg-green-100 text-green-800',
      'PHYSICIAN_ASSISTANT': 'bg-teal-100 text-teal-800',
      'PATIENT': 'bg-yellow-100 text-yellow-800',
      'RECEPTIONIST': 'bg-gray-100 text-gray-800',
      'PHARMACIST': 'bg-indigo-100 text-indigo-800',
      'LAB_TECHNICIAN': 'bg-red-100 text-red-800',
      'BILLING_STAFF': 'bg-orange-100 text-orange-800',
      'RADIOLOGIST': 'bg-pink-100 text-pink-800',
    };
  
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[role] || 'bg-gray-100 text-gray-800'}`;
  }
  

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${
      classes[status] || 'bg-gray-100 text-gray-800'
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
    this.userForm.reset();
    this.userForm.get('role')?.setValue('STAFF');
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.displayUserDialog = true;
  }

  showImportDialog() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.uploadedPreview = [];
    this.displayImportDialog = true;
  }

  viewUser(user: any) {
    this.selectedUser = user;
    this.displayViewDialog = true;
  }

  editUser(user: any) {
    this.selectedUser = user;
    
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      languages: user.languages || [],
      workingDays: user.workingDays || []
    });

    // Remove password validation for edit
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.displayUserDialog = true;
  }

  resetPassword(user: any) {
    this.selectedUser = user;
    this.resetPasswordForm.reset();
    this.displayResetDialog = true;
  }

  // User actions
  saveUser() {
    if (this.userForm.invalid) {
      return;
    }

    const userData = this.userForm.value;
    
    if (this.selectedUser) {
      // Update existing user
      this.userService.updateUser(this.selectedUser.id, userData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully'
          });
          this.displayUserDialog = false;
          this.loadUsers();
          this.updateStats();
        },
        error: (err) => {
          console.error('Failed to update user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update user'
          });
        }
      });
    } else {
      // Create new user
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User created successfully'
          });
          this.displayUserDialog = false;
          this.loadUsers();
          this.updateStats();
        },
        error: (err) => {
          console.error('Failed to create user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create user'
          });
        }
      });
    }
  }

  resetUserPassword() {
    if (this.resetPasswordForm.invalid || !this.selectedUser) {
      return;
    }

    const passwords = this.resetPasswordForm.value;
    
    this.userService.resetUserPassword(this.selectedUser.id, passwords.newPassword).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password reset successfully'
        });
        this.displayResetDialog = false;
      },
      error: (err) => {
        console.error('Failed to reset password:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset password'
        });
      }
    });
  }

  // Block user method using dedicated endpoint
  blockUser(userId: string) {
    this.blockingUser = true;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to block this user?',
      accept: () => {
        this.userService.blockUser(userId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User blocked successfully'
            });
            this.loadUsers();
            this.updateStats();
            this.blockingUser = false;
          },
          error: (err) => {
            console.error('Failed to block user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to block user'
            });
            this.blockingUser = false;
          }
        });
      },
      reject: () => {
        this.blockingUser = false;
      }
    });
  }

  // Unblock user method using dedicated endpoint
  unblockUser(userId: string) {
    this.unblockingUser = true;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to unblock this user?',
      accept: () => {
        this.userService.unblockUser(userId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User unblocked successfully'
            });
            this.loadUsers();
            this.updateStats();
            this.unblockingUser = false;
          },
          error: (err) => {
            console.error('Failed to unblock user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to unblock user'
            });
            this.unblockingUser = false;
          }
        });
      },
      reject: () => {
        this.unblockingUser = false;
      }
    });
  }

  // Combined method for toggling user status using specific endpoints
  toggleUserStatus(user: any) {
    if (user.status === 'active') {
      this.blockUser(user.id);
    } else {
      this.unblockUser(user.id);
    }
  }

  // Admin role management
  promoteToAdmin(userId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to promote this user to Admin role?',
      accept: () => {
        this.userService.updateUserRole(userId, 'ADMIN').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User promoted to Admin successfully'
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Failed to promote user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to promote user'
            });
          }
        });
      }
    });
  }

  demoteFromAdmin(userId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove Admin privileges from this user?',
      accept: () => {
        this.userService.updateUserRole(userId, 'STAFF').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User demoted from Admin successfully'
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Failed to demote user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to demote user'
            });
          }
        });
      }
    });
  }

  // File handling for import
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
      this.previewCsv();
    }
  }

  previewCsv() {
    if (!this.selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = reader.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      this.uploadedPreview = [];
      
      // Get first 5 rows for preview
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const user: any = {};
        
        headers.forEach((header, index) => {
          user[header.trim()] = values[index]?.trim();
        });
        
        this.uploadedPreview.push(user);
      }
    };
    
    reader.readAsText(this.selectedFile);
  }

  importUsers() {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // this.userService.importUsers("this.previewCsv").subscribe({
    //   next: (response) => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       // detail: `${response.importedCount} users imported successfully`
    //     });
    //     this.displayImportDialog = false;
    //     this.selectedFile = null;
    //     this.selectedFileName = '';
    //     this.uploadedPreview = [];
    //     this.loadUsers();
    //     this.updateStats();
    //   },
    //   error: (err) => {
    //     console.error('Failed to import users:', err);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to import users: ' + (err.error?.message || 'Unknown error')
    //     });
    //   }
    // });
  }
}