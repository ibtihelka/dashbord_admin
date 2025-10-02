import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Vérification de l\'accès à', state.url);
    
    if (!this.authService.isLoggedIn()) {
      console.log('AuthGuard: Utilisateur non connecté, redirection vers login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRole = route.data['role'];
    const userType = this.authService.getUserType();
    
    console.log('AuthGuard: Type utilisateur actuel:', userType);
    console.log('AuthGuard: Rôle requis:', requiredRole);

    // Vérifier les permissions selon la route
    if (requiredRole === 'ADMIN' && userType !== 'ADMIN') {
      console.log('AuthGuard: Accès admin refusé, redirection vers clients');
      this.router.navigate(['/clients']);
      return false;
    }
    
    if (requiredRole === 'USER' && userType !== 'USER') {
      console.log('AuthGuard: Accès user refusé, redirection vers admin');
      this.router.navigate(['/admin']);
      return false;
    }

    console.log('AuthGuard: Accès autorisé');
    return true;
  }
}