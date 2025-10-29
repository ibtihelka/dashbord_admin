import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { User } from 'src/app/demo/api/login.model';
import { Subscription } from 'rxjs';

interface FamilyMember {
  prenomPrestataire?: string;
  persoId?: string;
  persoName?: string;
  typPrestataire: string;
  datNais?: string;
  sexe?: string;
  situationAdhesion?: string;
}

@Component({
  selector: 'app-prestataire-list',
  templateUrl: './prestataire-list.component.html',
  styleUrls: ['./prestataire-list.component.scss']
})
export class PrestataireListComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();
  
  displayModal: boolean = false;
  modalTitle: string = 'Liste des Prestataires';
  prestataires: FamilyMember[] = [];
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
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

  /**
   * Affiche tous les prestataires (conjoint + enfants)
   */
showAllPrestataires() {
  if (!this.currentUser?.familles) {
    return;
  }

  // Filtrer conjoint et enfants
  this.prestataires = this.currentUser.familles.filter(
    membre => {
      const type = membre.typPrestataire?.toUpperCase();
      return type === 'CONJOINT' || type === 'ENFANT';
    }
  );

  // Trier : conjoint d'abord, puis enfants
  this.prestataires.sort((a, b) => {
    const typeA = a.typPrestataire?.toUpperCase() || '';
    const typeB = b.typPrestataire?.toUpperCase() || '';
    
    if (typeA === typeB) return 0;
    if (typeA === 'CONJOINT') return -1;  // conjoint en premier
    if (typeB === 'CONJOINT') return 1;
    return 0;
  });

  if (this.prestataires.length > 0) {
    this.modalTitle = 'Liste des Prestataires';
    this.displayModal = true;
  }
}



  /**
   * Affiche uniquement le conjoint
   */
  showConjoint() {
    if (!this.currentUser?.familles) {
      return;
    }

    this.prestataires = this.currentUser.familles.filter(
      membre => membre.typPrestataire?.toUpperCase() === 'CONJOINT'
    );

    if (this.prestataires.length > 0) {
      this.modalTitle = 'Conjoint';
      this.displayModal = true;
    }
  }

  /**
   * Affiche uniquement les enfants
   */
  showEnfants() {
    if (!this.currentUser?.familles) {
      return;
    }

    this.prestataires = this.currentUser.familles.filter(
      membre => membre.typPrestataire?.toUpperCase() === 'ENFANT'
    );

    if (this.prestataires.length > 0) {
      this.modalTitle = this.prestataires.length > 1 ? 'Enfants' : 'Enfant';
      this.displayModal = true;
    }
  }

  /**
   * Vérifie si des prestataires existent (conjoint ou enfants)
   */
  hasPrestataires(): boolean {
    if (!this.currentUser?.familles) return false;
    return this.currentUser.familles.some(
      membre => {
        const type = membre.typPrestataire?.toUpperCase();
        return type === 'CONJOINT' || type === 'ENFANT';
      }
    );
  }

  /**
   * Ferme le modal
   */
  closeModal() {
    this.displayModal = false;
    this.prestataires = [];
  }

  /**
   * Obtient le nom du prestataire
   */
  getPrestataireDisplayName(prestataire: FamilyMember): string {
    return prestataire.prenomPrestataire || prestataire.persoName || 'Nom non disponible';
  }

  /**
   * Obtient le type de prestataire en français
   */
  getTypePrestataire(type: string): string {
    const types: { [key: string]: string } = {
      'CONJOINT': 'Conjoint(e)',
      'ENFANT': 'Enfant'
    };
    return types[type?.toUpperCase()] || type;
  }

  /**
   * Formate une date
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  }

  /**
   * Calcule l'âge à partir de la date de naissance
   */
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

  /**
   * Affiche le sexe
   */
  getSexeDisplay(sexe: string): string {
    if (!sexe) return 'N/A';
    // Le sexe peut être stocké comme 'Masculin'/'Féminin' ou 'H'/'F'
    if (sexe === 'Masculin' || sexe === 'H') return 'Homme';
    if (sexe === 'Féminin' || sexe === 'F') return 'Femme';
    return sexe;
  }

  /**
   * Affiche la situation d'adhésion
   */
  getSituationAdhesion(situation: string): string {
    const situations: { [key: string]: string } = {
      'A': 'Actif',
      'S': 'Suspendu',
      'R': 'Radié',
      'E': 'En attente'
    };
    return situations[situation] || situation || 'N/A';
  }
}