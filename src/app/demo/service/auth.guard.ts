// auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const userType = this.authService.getUserType();
    const requiredRole = route.data['role'];

    // Si l'utilisateur n'est pas connecté
    if (!userType) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Vérifier si le rôle correspond
    if (requiredRole && userType !== requiredRole) {
      // Rediriger vers le tableau de bord approprié
      this.redirectToAppropriateRoute(userType);
      return false;
    }

    return true;
  }

  private redirectToAppropriateRoute(userType: string): void {
    switch (userType) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'USER':
        this.router.navigate(['/clients/accueil']);
        break;
      case 'PRESTATAIRE':
        this.router.navigate(['/prestataire/mes-rapports']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}