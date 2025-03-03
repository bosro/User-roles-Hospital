import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  currentUser: any;

  menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'ri-user-settings-line',
      command: () => this.router.navigate(['/profile']),
    },
    {
      label: 'Logout',
      icon: 'ri-logout-box-line',
      command: () => this.logout(),
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.currentUserValue;
  }

  // logout() {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
}
