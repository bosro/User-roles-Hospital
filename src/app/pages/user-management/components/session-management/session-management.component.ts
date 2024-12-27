import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";
import { ConfirmationService } from "primeng/api";
import { Button } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";

interface Session {
  id: string;
  device: string;
  startTime: Date;
  ipAddress: string;
  location: string;
  browser: string;
}

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [
    Button,
    CardModule,
    TableModule,
    DatePipe
  ],
  templateUrl: 'session-management.component.html'
})
export class SessionManagementComponent {
  activeSessions: Session[] = [];
  loading = false;

  constructor(private confirmationService: ConfirmationService) {}

  getDeviceIcon(device: string): string {
    const icons: { [key: string]: string } = {
      'desktop': 'ri-computer-line',
      'mobile': 'ri-smartphone-line',
      'tablet': 'ri-tablet-line'
    };
    return icons[device.toLowerCase()] || 'ri-device-line';
  }

  getDuration(startTime: Date): string {
    const diff = new Date().getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutes`;
  }

  terminateSession(session: Session) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to terminate this session?',
      accept: () => {
        // Implement session termination
      }
    });
  }

  confirmTerminateAll() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to terminate all active sessions?',
      accept: () => {
        // Implement bulk session termination
      }
    });
  }
}