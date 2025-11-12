// client-navbar.component.ts - VERSION NAVBAR SEULEMENT
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/demo/api/login.model';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-client-navbar',
  templateUrl: './client-navbar.component.html',
  styleUrls: ['./client-navbar.component.scss']
})
export class ClientNavbarComponent implements OnInit, OnDestroy {
  isProfileDropdownOpen = false;
  currentUser: User | null = null;
  isTeleperformanceUser: boolean = false;
  teleperformanceUrl: string = 'https://www.tp.com/fr-tn/emplacements/tunisia/';
  private userSubscription: Subscription = new Subscription();

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // S'abonner aux changements de l'utilisateur connecté
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        this.checkIfTeleperformanceUser();
        console.log('👤 User loaded:', user);
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkIfTeleperformanceUser(): void {
    if (this.currentUser && this.currentUser.persoId) {
      const persoIdPrefix = this.currentUser.persoId.substring(0, 8);
      this.isTeleperformanceUser = persoIdPrefix === 'SO000008';
    }
  }

  openTeleperformanceWebsite(): void {
    window.open(this.teleperformanceUrl, '_blank');
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeDropdown() {
    this.isProfileDropdownOpen = false;
  }

  // Navigation methods
  navigateToHome() {
    this.router.navigate(['/clients/accueil']);
    this.closeDropdown();
  }

  navigateToProfile() {
    this.router.navigate(['/clients/profile']);
    this.closeDropdown();
  }

  navigateToRemboursements() {
    this.router.navigate(['/clients/mesRemboursements']);
    this.closeDropdown();
  }

  navigateToSuggestions(): void {
    this.router.navigate(['/clients/reclamations']);
    this.closeDropdown();
  }

  navigateToChangeRib() {
    this.router.navigate(['/clients/rib']);
    this.closeDropdown();
  }

  navigateToChangePhone() {
    this.router.navigate(['/clients/tel']);
    this.closeDropdown();
  }

  navigateToProfil() {
    this.router.navigate(['/clients/profile']);
    this.closeDropdown();
  }


  navigateTotabpres() {
    this.router.navigate(['/clients/profile']);
    this.closeDropdown();
  }

  

  isRouteActive(route: string): boolean {
    const routeMap: { [key: string]: string } = {
      'accueil': '/clients/accueil',
      'profile': '/clients/profile',
      'mesRemboursements': '/clients/mesRemboursements',
      'mes-suggestions': '/clients/reclamations',
      'changement-rib': '/clients/rib',
      'changement-tel': '/clients/changement-tel'
    };
    
    const fullRoute = routeMap[route] || route;
    return this.router.url.includes(fullRoute);
  }

  logout() {
    console.log('Déconnexion...');
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return this.currentUser.persoName 
      ? `${this.currentUser.persoName}` 
      : this.currentUser.persoName || this.currentUser.persoId || 'Utilisateur';
  }

  getUserEmail(): string {
    return this.currentUser?.email || 'email@example.com';
  }

  getUserId(): string {
    return this.currentUser?.persoId || 'N/A';
  }

  getUserRib(): string {
    return this.currentUser?.rib || 'N/A';
  }
}