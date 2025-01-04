import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, retry, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { NotificationCategory, NotificationType } from './notifications.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private readonly RECONNECT_INTERVAL = 5000;

  constructor(private authService: AuthService, private http: HttpClient) {}

  connect(url: string): Observable<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(url);
    }

    return this.socket$.pipe(
      retry({ delay: this.RECONNECT_INTERVAL }),
      catchError(error => {
        console.error('WebSocket error:', error);
        return EMPTY;
      })
    );
  }

  sendMessage(message: any) {
    if (this.socket$) {
      this.socket$.next(message);
    }
  }

  closeConnection() {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  private getNewWebSocket(url: string): WebSocketSubject<any> {
    return webSocket({
      url: `${url}?token=${this.authService.getToken()}`,
      openObserver: {
        next: () => {
          console.log('WebSocket connected');
          this.sendMessage({ type: 'subscribe', data: { userId: this.authService.getCurrentUserId() } });
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket disconnected');
          // Implement reconnection logic if needed
        }
      }
    });
  }
}

