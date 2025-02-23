import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const currentUser = this.authService.currentUserValue;
    const requiredRoles = route.data['roles'] as Array<string>;

    if (currentUser && requiredRoles.includes(currentUser.role)) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}