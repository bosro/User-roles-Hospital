import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../pages/user-management/models/user.model';

// Update the roles enum
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  PHYSICIAN_ASSISTANT = 'PHYSICIAN_ASSISTANT',
  PATIENT = 'PATIENT',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  BILLING_STAFF = 'BILLING_STAFF',
  ADMINISTRATOR = 'ADMINISTRATOR',
  RADIOLOGIST = 'RADIOLOGIST'
}

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  isExpanded?: boolean;
  children?: Omit<MenuItem, 'children'>[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  currentPageTitle: string = 'Dashboard'; 
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  currentUser$: Observable<User>;
  searchQuery = '';
  notifications: any[] = [];
  unreadNotificationsCount = 0;

  isProfileMenuOpen = false;
  currentPath = '';
  userRole: UserRole | null = null;

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHYSICIAN_ASSISTANT, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.LAB_TECHNICIAN, UserRole.BILLING_STAFF, UserRole.RADIOLOGIST, UserRole.PATIENT]
    },
    {
      title: 'Patients',
      path: '/patients',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHYSICIAN_ASSISTANT, UserRole.RECEPTIONIST],
      children: [
        {
          title: 'All Patients',
          path: '/patients',
          icon: 'M15 2.75a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h4.5a.75.75 0 01.75.75zM4 5.5c0-1.086.577-2.036 1.44-2.562l.007-.005A3.983 3.983 0 017 2.25h2a.75.75 0 010 1.5H7a2.487 2.487 0 00-1.753.724l-.122.123A2.486 2.486 0 004.5 7v10a2.49 2.49 0 002.25 2.478V4.5z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHYSICIAN_ASSISTANT, UserRole.RECEPTIONIST]
        },
        {
          title: 'Add Patient',
          path: '/patients/add',
          icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR,UserRole.DOCTOR, UserRole.RECEPTIONIST]
        },
      ],
    },
    {
      title: 'Appointments',
      path: '/appointments',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE,  ],
      children: [
        {
          title: 'Calendar',
          path: '/appointments/calendar',
          icon: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHYSICIAN_ASSISTANT, UserRole.RECEPTIONIST, UserRole.PATIENT]
        },
        {
          title: 'List View',
          path: '/appointments/list',
          icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHYSICIAN_ASSISTANT, UserRole.RECEPTIONIST, UserRole.PATIENT]
        },
      ],
    },
    {
      title: 'Doctors',
      path: '/doctors',
      icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.PATIENT, UserRole.RECEPTIONIST]
    },
    {
      title: 'Departments',
      path: '/departments',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR]
    },
    {
      title: 'Inventory',
      path: '/inventory',
      icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.PHARMACIST,  UserRole.PATIENT, UserRole.LAB_TECHNICIAN, UserRole.NURSE],
      children: [
        {
          title: 'Dashboard',
          path: '/inventory/dashboard',
          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.PHARMACIST,  UserRole.PATIENT, UserRole.LAB_TECHNICIAN, UserRole.NURSE]
        },
        {
          title: 'Medicines',
          path: '/inventory/medicines',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.PATIENT,  UserRole.PHARMACIST]
        },
        {
          title: 'Equipment',
          path: '/inventory/equipment',
          icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.LAB_TECHNICIAN, UserRole.NURSE]
        },
      ],
    },
    {
      title: 'Billing',
      path: '/billing',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BILLING_STAFF,  UserRole.PATIENT, UserRole.RECEPTIONIST],
      children: [
        {
          title: 'Dashboard',
          path: '/billing/dashboard',
          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BILLING_STAFF]
        },
        {
          title: 'All Invoices',
          path: '/billing/invoices',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BILLING_STAFF, UserRole.PATIENT,  UserRole.RECEPTIONIST]
        },
        {
          title: 'Create Invoice',
          path: '/billing/invoices/create',
          icon: 'M12 4v16m8-8H4',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.BILLING_STAFF]
        },
      ],
    },
 
    {
      title: 'Reports',
      path: '/reports',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR]
    },
 
    {
      title: 'User Management',
      path: '/user-management',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR],
      children: [
        {
          title: 'Users',
          path: '/user-management/users',
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR]
        },
        {
          title: 'Active Sessions',
          path: '/user-management/sessions',
          icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
          roles: [UserRole.SUPER_ADMIN]
        },
      ]
    },
    // {
    //   title: 'Laboratory',
    //   path: '/laboratory',
    //   icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    //   roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.LAB_TECHNICIAN, UserRole.DOCTOR]
    // },
    // {
    //   title: 'Radiology',
    //   path: '/radiology',
    //   icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    //   roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.RADIOLOGIST, UserRole.DOCTOR]
    // },
    {
      title: 'Profile-settings',
      path: '/profile',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1c-1.29 1.94-3.5 3.22-6 3.22z',
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHYSICIAN_ASSISTANT, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.LAB_TECHNICIAN, UserRole.BILLING_STAFF, UserRole.RADIOLOGIST, UserRole.PATIENT]
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser as Observable<User>;
    // Load user role when component is constructed
    this.loadUserRole();
  }

  ngOnInit(): void {
    this.loadNotifications();
    console.log(this.loadUserRole())
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.urlAfterRedirects;
        this.menuItems.forEach((item) => {
          if (item.children) {
            item.isExpanded = item.children.some(
              (child) => child.path === this.currentPath
            );
          }
        });
      });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Load user role from localStorage
  loadUserRole(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          this.userRole = user.role as UserRole;
          console.log('User role loaded:', this.userRole);
        } else {
          console.error('User object does not contain role property:', user);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    } else {
      console.warn('No user found in localStorage');
      // Redirect to login if no user is found
      this.router.navigate(['auth/login']);
    }
  }

  hasAccess(item: MenuItem): boolean {
    // If no roles are specified for the menu item, everyone has access
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    // Check if user role exists and is in the allowed roles for this menu item
    return !!this.userRole && item.roles.includes(this.userRole);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['auth/login']);
  }
  
  private loadNotifications(): void {
    // Implement notification loading logic
    this.unreadNotificationsCount = 3; // Example count
  }
}