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
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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

  navigateToSuggestions() {
    this.router.navigate(['/clients/suggestions-reclamations']);
    this.closeDropdown();
  }

  navigateToChangeRib() {
    this.router.navigate(['/clients/changement-rib']);
    this.closeDropdown();
  }

  navigateToChangePhone() {
    this.router.navigate(['/clients/changement-tel']);
    this.closeDropdown();
  }

  // Vérifier si une route est active
  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logout() {
    console.log('Déconnexion...');
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Méthodes utilitaires pour l'affichage
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return this.currentUser.persoName 
      ? `${this.currentUser.persoName} `
      : this.currentUser.persoName || this.currentUser.persoId|| 'Utilisateur';
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