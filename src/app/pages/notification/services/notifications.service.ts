import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebSocketService } from './websocket.service';
import { AuthService } from '../../../auth/auth.service';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: NotificationCategory;
  metadata?: NotificationMetadata;
  actions?: NotificationAction[];
}

export type NotificationType = 
  | 'emergency' 
  | 'alert' 
  | 'reminder' 
  | 'info';

export type NotificationCategory = 
  | 'doctor' 
  | 'patient' 
  | 'admin' 
  | 'system';

export interface NotificationMetadata {
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  vitals?: {
    type: string;
    value: number;
    unit: string;
    threshold: number;
  };
  location?: {
    ward?: string;
    room?: string;
    bed?: string;
  };
  severity?: 'critical' | 'warning' | 'normal';
  [key: string]: any;
}

export interface NotificationAction {
  type: 'link' | 'button';
  label: string;
  action: string;
  severity?: 'success' | 'info' | 'warn' | 'danger';
  data?: any;
}

export interface NotificationPreferences {
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSoundAlerts: boolean;
  mutedUntil?: Date;
  priorities: {
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  categories: {
    [key in NotificationCategory]: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private _notificationStream = new Subject<Notification>();
  private _unreadCount = new BehaviorSubject<number>(0);
  
  notificationStream = this._notificationStream.asObservable();
  unreadCount = this._unreadCount.asObservable();

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService,
    private authService: AuthService
  ) {
    this.initializeRealTimeNotifications();
    this.startPolling();
  }

  private initializeRealTimeNotifications() {
    this.wsService.connect(`${environment.wsUrl}/notifications`)
      .subscribe({
        next: (notification: Notification) => {
          this.handleNewNotification(notification);
        }
      });
  }

  private startPolling() {
    // Poll for notifications every minute as backup for websocket
    interval(60000).subscribe(() => {
      this.checkNewNotifications();
    });
  }

  private checkNewNotifications() {
    const lastCheck = localStorage.getItem('lastNotificationCheck');
    this.http.get<Notification[]>(`${this.apiUrl}/new`, {
      params: { since: lastCheck || new Date().toISOString() }
    }).subscribe({
      next: (notifications) => {
        notifications.forEach(notification => {
          this.handleNewNotification(notification);
        });
        localStorage.setItem('lastNotificationCheck', new Date().toISOString());
      }
    });
  }

  private handleNewNotification(notification: Notification) {
    this._notificationStream.next(notification);
    if (!notification.read) {
      this._unreadCount.next(this._unreadCount.value + 1);
    }
  }

  getNotifications(params?: {
    type?: NotificationType;
    category?: NotificationCategory;
    read?: boolean;
    priority?: 'high' | 'medium' | 'low';
    startDate?: Date;
    endDate?: Date;
  }): Observable<Notification[]> {
    // return this.http.get<Notification[]>(this.apiUrl, { params });
    return this.http.get<Notification[]>(this.apiUrl);

  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear-all`);
  }

  updatePreferences(preferences: NotificationPreferences): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/preferences`, preferences);
  }

  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/preferences`);
  }

  // Specific notification creators for different scenarios
  createEmergencyNotification(data: {
    title: string;
    message: string;
    patientId: string;
    doctorId: string;
    location?: { ward: string; room: string; bed: string; };
    vitals?: { type: string; value: number; unit: string; threshold: number; };
  }): Observable<Notification> {
    const notification = {
      type: 'emergency' as NotificationType,
      priority: 'high' as const,
      category: 'doctor' as NotificationCategory,
      title: data.title,
      message: data.message,
      metadata: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        location: data.location,
        vitals: data.vitals
      },
      actions: [
        {
          type: 'button',
          label: 'Respond Now',
          action: 'respondEmergency',
          severity: 'danger'
        },
        {
          type: 'link',
          label: 'View Patient',
          action: 'viewPatient'
        }
      ]
    };

    return this.http.post<Notification>(`${this.apiUrl}/emergency`, notification);
  }

  createHealthRiskAlert(data: {
    patientId: string;
    condition: string;
    riskLevel: 'high' | 'medium' | 'low';
    details: string;
  }): Observable<Notification> {
    const notification = {
      type: 'alert' as NotificationType,
      priority: data.riskLevel === 'high' ? 'high' : 'medium',
      category: 'patient' as NotificationCategory,
      title: `Health Risk Alert - ${data.condition}`,
      message: data.details,
      metadata: {
        patientId: data.patientId,
        severity: data.riskLevel === 'high' ? 'critical' : 'warning'
      },
      actions: [
        {
          type: 'button',
          label: 'Schedule Appointment',
          action: 'scheduleAppointment',
          severity: 'warning'
        },
        {
          type: 'link',
          label: 'View Health Record',
          action: 'viewHealthRecord'
        }
      ]
    };

    return this.http.post<Notification>(`${this.apiUrl}/health-risk`, notification);
  }

  createAppointmentReminder(data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    datetime: Date;
    type: string;
  }): Observable<Notification> {
    const notification = {
      type: 'reminder' as NotificationType,
      priority: 'medium',
      category: 'patient' as NotificationCategory,
      title: 'Upcoming Appointment Reminder',
      message: `You have a ${data.type} appointment scheduled for ${new Date(data.datetime).toLocaleString()}`,
      metadata: {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId: data.doctorId
      },
      actions: [
        {
          type: 'button',
          label: 'Confirm Attendance',
          action: 'confirmAppointment',
          severity: 'success'
        },
        {
          type: 'button',
          label: 'Reschedule',
          action: 'rescheduleAppointment',
          severity: 'warning'
        }
      ]
    };

    return this.http.post<Notification>(`${this.apiUrl}/appointment-reminder`, notification);
  }

  createMedicationReminder(data: {
    patientId: string;
    medication: string;
    dosage: string;
    frequency: string;
    timing: string;
  }): Observable<Notification> {
    const notification = {
      type: 'reminder' as NotificationType,
      priority: 'high',
      category: 'patient' as NotificationCategory,
      title: 'Medication Reminder',
      message: `Time to take ${data.dosage} of ${data.medication} (${data.timing})`,
      metadata: {
        patientId: data.patientId,
        medicationDetails: {
          name: data.medication,
          dosage: data.dosage,
          frequency: data.frequency
        }
      },
      actions: [
        {
          type: 'button',
          label: 'Mark as Taken',
          action: 'medicationTaken',
          severity: 'success'
        },
        {
          type: 'button',
          label: 'Snooze',
          action: 'snoozeMedication',
          severity: 'info'
        }
      ]
    };

    return this.http.post<Notification>(`${this.apiUrl}/medication-reminder`, notification);
  }
}