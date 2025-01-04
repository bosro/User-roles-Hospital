import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../services/notifications.service';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
type ButtonSeverity = 'secondary' | 'primary' | 'success' | 'info' | 'warn' | 'danger';

interface Notification {
  id: string;
  type: 'emergency' | 'alert' | 'reminder' | 'info';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'doctor' | 'patient' | 'admin' | 'system';
  metadata?: {
    patientId?: string;
    doctorId?: string;
    appointmentId?: string;
    [key: string]: any;
  };
  actions?: {
    type: 'link' | 'button';
    label: string;
    action: string;
  }[];
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    BadgeModule,
    ToastModule,
    DropdownModule,
    FormsModule,
    TagModule
  ],
  templateUrl: 'notifications.component.html'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedFilter = '';
  emergencyCount = 0;
  unreadCount = 0;
  reminderCount = 0;
  resolvedCount = 0;
  private destroy$ = new Subject<void>();

  filterOptions = [
    { label: 'All', value: '' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Alerts', value: 'alert' },
    { label: 'Reminders', value: 'reminder' },
    { label: 'Information', value: 'info' }
  ];

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadNotifications();
    this.setupRealtimeNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.updateCounts();
        this.applyFilter();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load notifications'
        });
      }
    });
  }

  private setupRealtimeNotifications() {
    this.notificationService.notificationStream
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notification) => {
          this.handleNewNotification(notification);
        }
      });
  }

  private handleNewNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.updateCounts();
    this.applyFilter();

    if (notification.priority === 'high') {
      this.messageService.add({
        severity: 'warn',
        summary: notification.title,
        detail: notification.message,
        sticky: true
      });
    }

    // Play sound for emergency notifications
    if (notification.type === 'emergency') {
      this.playEmergencyAlert();
    }
  }

  private playEmergencyAlert() {
    const audio = new Audio('assets/sounds/emergency-alert.mp3');
    audio.play();
  }

  private updateCounts() {
    this.emergencyCount = this.notifications.filter(n => n.type === 'emergency').length;
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.reminderCount = this.notifications.filter(n => n.type === 'reminder').length;
    this.resolvedCount = this.notifications.filter(n => n.read && new Date(n.timestamp).toDateString() === new Date().toDateString()).length;
  }

  applyFilter() {
    this.filteredNotifications = this.selectedFilter
      ? this.notifications.filter(n => n.type === this.selectedFilter)
      : this.notifications;
  }

  getNotificationSeverity(type: Notification['type']): TagSeverity {
    const severities: Record<Notification['type'], TagSeverity> = {
      'emergency': 'danger',
      'alert': 'warn',
      'reminder': 'info',
      'info': 'success'
    };
    return severities[type];
  }

  getActionSeverity(type: string): ButtonSeverity {
    return type === 'button' ? 'primary' : 'secondary';
  }
  
  markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.updateCounts();
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.updateCounts();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All notifications marked as read'
        });
      }
    });
  }

  deleteNotification(notification: Notification) {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.updateCounts();
        this.applyFilter();
      }
    });
  }

  clearAll() {
    this.notificationService.clearAll().subscribe({
      next: () => {
        this.notifications = [];
        this.updateCounts();
        this.applyFilter();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All notifications cleared'
        });
      }
    });
  }

  handleAction(notification: Notification, action: any) {
    // Handle different action types
    switch (action.action) {
      case 'viewPatient':
        // Navigate to patient details
        break;
      case 'respondEmergency':
        // Handle emergency response
        break;
      case 'scheduleFollowUp':
        // Navigate to scheduling
        break;
      // Add more action handlers
    }
  }
}