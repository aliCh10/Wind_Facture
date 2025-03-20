import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({
  providedIn: 'root' // Cela permet de s'assurer que le guard est disponible pour toute l'application
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  // Méthode canActivate pour gérer l'accès aux routes protégées
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true; // L'utilisateur est authentifié, il peut accéder à la route
    } else {
      this.router.navigate(['/signin']); // Redirige vers la page de connexion si non authentifié
      return false; // L'utilisateur ne peut pas accéder à la route
    }
  }
}
