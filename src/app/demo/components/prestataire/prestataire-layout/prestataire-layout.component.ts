import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Prestataire } from 'src/app/demo/api/prestataire.model';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-prestataire-layout',
  templateUrl: './prestataire-layout.component.html',
  styleUrls: ['./prestataire-layout.component.scss']
})
export class PrestataireLayoutComponent implements OnInit {
  prestataire: Prestataire | null = null;
  sidebarVisible: boolean = false;

  menuItems = [
    
    {
      label: 'Mes rapports',
      icon: 'pi pi-list',
      routerLink: '/prestataire/mes-rapports'
    },
   {
      label: 'Créer un rapport',
      icon: 'pi pi-file-edit',
      routerLink: '/prestataire/creer-rapport',
     
      badgeClass: 'p-badge-success'
    }, {
      label: 'Mon profil',
      icon: 'pi pi-user',
      routerLink: '/prestataire/profil'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.prestataire = this.authService.getCurrentPrestataire();
    
    if (!this.prestataire) {
      this.router.navigate(['/auth/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  getRoleIcon(): string {
    return this.prestataire?.role === 'DENTISTE' ? 'pi-heart' : 'pi-eye';
  }

  getRoleColor(): string {
    return this.prestataire?.role === 'DENTISTE' ? 'text-blue-500' : 'text-purple-500';
  }

  getFullNameWithTitle(): string {
  if (!this.prestataire) return '';
  const titre = this.prestataire.sexe?.toLowerCase() === 'femme' ? 'Docteur' : 'Docteur';
  return `${titre} ${this.prestataire.nom} ${this.prestataire.prenom || ''}`.trim();
}

}