import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      const role = localStorage.getItem('role');
      const url = state.url;

      if ((role === 'PARTNER' && url.includes('/system')) || (role === 'System' && url.includes('/home'))) {
        this.router.navigate(['/404']);

      }

      return true;
    } else {
      this.router.navigate(['/404']);
      return false;
    }
  }
}