// auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
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
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    
    const userType = this.authService.getUserType();
    const requiredRole = route.data['role'];

    console.log('AuthGuard - URL demandée:', state.url);
    console.log('AuthGuard - UserType actuel:', userType);
    console.log('AuthGuard - Rôle requis:', requiredRole);

    // Si l'utilisateur n'est pas connecté
    if (!userType) {
      console.log('AuthGuard - Utilisateur non connecté, redirection vers login');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Si aucun rôle spécifique n'est requis, autoriser l'accès
    if (!requiredRole) {
      console.log('AuthGuard - Aucun rôle requis, accès autorisé');
      return true;
    }

    // Vérifier si le rôle correspond
    if (userType === requiredRole) {
      console.log('AuthGuard - Rôle correspond, accès autorisé');
      return true;
    }

    // Rôle ne correspond pas, rediriger vers le tableau de bord approprié
    console.log('AuthGuard - Rôle ne correspond pas, redirection');
    return this.redirectToAppropriateRoute(userType);
  }

  private redirectToAppropriateRoute(userType: string): UrlTree {
    switch (userType) {
      case 'ADMIN':
        console.log('AuthGuard - Redirection vers admin dashboard');
        return this.router.createUrlTree(['/admin/dashboard']);
      case 'USER':
        console.log('AuthGuard - Redirection vers clients/accueil');
        return this.router.createUrlTree(['/clients/accueil']);
      case 'PRESTATAIRE':
        console.log('AuthGuard - Redirection vers prestataire/mes-rapports');
        return this.router.createUrlTree(['/prestataire/mes-rapports']);
      case 'SOCIETE':
        console.log('AuthGuard - Redirection vers societe/bordereaux');
        return this.router.createUrlTree(['/societe/bordereaux']);
      default:
        console.log('AuthGuard - Type utilisateur inconnu, redirection vers login');
        return this.router.createUrlTree(['/auth/login']);
    }
  }
}