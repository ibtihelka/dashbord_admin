import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/demo/api/login.model';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss']
})
export class ClientProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();
  isEditing = false;
  editableUser: any = {};

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        if (user) {
          // Copie des données pour l'édition
          this.editableUser = { ...user };
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Annuler les modifications
      if (this.currentUser) {
        this.editableUser = { ...this.currentUser };
      }
    }
  }

  saveProfile() {
    if (this.currentUser) {
      // TODO: Appeler le service pour sauvegarder les modifications
      console.log('Sauvegarde du profil:', this.editableUser);
      
      // Simulation de la sauvegarde
      // this.userService.updateProfile(this.editableUser).subscribe(...)
      
      this.isEditing = false;
      // Mettre à jour l'utilisateur actuel (temporaire)
      // Dans un vrai cas, récupérer les données depuis le serveur
    }
  }

  navigateToChangeRib() {
    this.router.navigate(['/clients/rib']);
  }

  navigateToChangePhone() {
    this.router.navigate(['/clients/tel']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return this.currentUser.persoName || this.currentUser.persoId || 'Utilisateur';
  }

  getAge(): string {
    if (!this.currentUser?.datNais) return 'N/A';
    try {
      const birthDate = new Date(this.currentUser.datNais);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return (age - 1).toString() + ' ans';
      }
      return age.toString() + ' ans';
    } catch {
      return 'N/A';
    }
  }

  getSituationFamiliale(): string {
    const situations: { [key: string]: string } = {
      'C': 'Célibataire',
      'M': 'Marié(e)',
      'D': 'Divorcé(e)',
      'V': 'Veuf/Veuve'
    };
    return situations[this.currentUser?.situationFamiliale || ''] || this.currentUser?.situationFamiliale || 'N/A';
  }

  getSexeDisplay(): string {
    return this.currentUser?.sexe === 'H' ? 'Homme' : this.currentUser?.sexe === 'F' ? 'Femme' : 'N/A';
  }

  getSituationAdhesion(): string {
    const situations: { [key: string]: string } = {
      'A': 'Actif',
      'S': 'Suspendu',
      'R': 'Radié',
      'E': 'En attente'
    };
    return situations[this.currentUser?.situationAdhesion || ''] || this.currentUser?.situationAdhesion || 'N/A';
  }

  // Méthodes pour la section Famille
  getTypePrestataire(type: string): string {
    const types: { [key: string]: string } = {
      'CONJOINT': 'Conjoint(e)',
      'ENFANT': 'Enfant',
      'PERE': 'Père',
      'MERE': 'Mère'
    };
    return types[type] || type;
  }

  calculateAge(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age + ' ans';
    } catch {
      return 'N/A';
    }
  }

  // Compte tous les membres (incluant l'adhérent)
  getTotalFamilyMemberCount(): number {
    return this.currentUser?.familles?.length || 0;
  }

  // Compte uniquement les membres à afficher (sans l'adhérent)
  getFamilyMemberCount(): number {
    return this.getFilteredFamilyMembers().length;
  }

  hasFamilyMembers(): boolean {
    return this.getFamilyMemberCount() > 0;
  }

  // Filtrer les membres de famille pour exclure la personne elle-même
getFilteredFamilyMembers(): any[] {
  if (!this.currentUser?.familles) {
    return [];
  }
  
  // Filtrer uniquement les membres qui ne sont pas la personne principale
  const filtered = this.currentUser.familles.filter(membre => 
    membre.typPrestataire &&
    membre.typPrestataire.toUpperCase() !== 'ADHERENT' &&
    membre.typPrestataire.toUpperCase() !== 'PRINCIPAL'
  );

  // Trier : conjoint d'abord, puis enfants, puis autres
  filtered.sort((a, b) => {
    const typeA = a.typPrestataire?.toUpperCase() || '';
    const typeB = b.typPrestataire?.toUpperCase() || '';
    
    if (typeA === typeB) return 0;
    if (typeA === 'CONJOINT') return -1;  // conjoint en premier
    if (typeB === 'CONJOINT') return 1;
    return 0;
  });

  return filtered;
}

}