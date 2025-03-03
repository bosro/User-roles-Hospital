import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ConfirmationService } from "primeng/api";
import { Button } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";
// import { SessionService, SessionData } from "../services/session.servic";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { HttpClientModule } from "@angular/common/http";
import { PermissionService, SessionData } from "../../services/permission.service";

interface Session {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActivity: Date;
  browser: string;
  userId:{
    firstName: string;
    lastName: string;

  }
  
  
}

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [
    Button,
    CardModule,
    TableModule,
    DatePipe,
    HttpClientModule
  ],
  templateUrl: 'session-management.component.html'
})
export class SessionManagementComponent implements OnInit {
  activeSessions: Session[] = [];
  loading = false;

  constructor(
    private confirmationService: ConfirmationService,
    private permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.loading = true;
    this.permissionService.getActiveSessions()
      .pipe(
        catchError(error => {
          console.error('Error loading sessions', error);
          return of({ success: false, count: 0, sessions: [] });
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        if (response.success) {
          this.activeSessions = response.sessions.map(session => this.mapSessionData(session));
        }
      });
  }

  mapSessionData(sessionData: SessionData): Session {
    const deviceInfo = this.parseUserAgent(sessionData.device);
    
    return {
      id: sessionData._id,
      device: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      userId:{
        firstName: sessionData.userId?.firstName,
        lastName: sessionData.userId?.lastName
      },
   
      // lasttName: deviceInfo?.userId.lastName,
      location: sessionData.location,
      ipAddress: sessionData.ipAddress,
      lastActivity: new Date(sessionData.lastActivity)
    };
  }

  parseUserAgent(userAgent: string): { deviceType: string, browser: string } {
    // Simple user agent parsing logic
    let deviceType = 'desktop';
    let browser = 'Unknown';
    
    if (userAgent.includes('Mobile')) {
      deviceType = 'mobile';
    } else if (userAgent.includes('Tablet')) {
      deviceType = 'tablet';
    }
    
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
    } else if (userAgent.includes('Postman')) {
      browser = 'Postman';
    }
    
    return { deviceType, browser };
  }

  getDeviceIcon(device: string): string {
    const icons: { [key: string]: string } = {
      'desktop': 'ri-computer-line',
      'mobile': 'ri-smartphone-line',
      'tablet': 'ri-tablet-line'
    };
    return icons[device.toLowerCase()] || 'ri-device-line';
  }

  getDuration(lastActivity: Date): string {
    const diff = new Date().getTime() - lastActivity.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
  }

  terminateSession(session: Session) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to terminate this session?',
      accept: () => {
        this.loading = true;
        this.permissionService.terminateSession(session.id)
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe(() => {
            this.loadSessions();
          });
      }
    });
  }

  confirmTerminateAll() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to terminate all active sessions?',
      accept: () => {
        this.loading = true;
        this.permissionService.terminateAllSessions()
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe(() => {
            this.loadSessions();
          });
      }
    });
  }
}