import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/demo/service/auth.service';

interface Rib {
  rib: string;
  dateCreation?: string;
  numRib?: string;
}

@Component({
  selector: 'app-mes-ribs',
  templateUrl: './mes-ribs.component.html',
  styleUrls: ['./mes-ribs.component.scss'],
  providers: [MessageService]
})
export class MesRibsComponent implements OnInit {
  currentRib: Rib | null = null;
  loading: boolean = true;
  persoId: string = '';
  displayModifyRibDialog: boolean = false;

  modifyRibForm = {
    ancienRib: '',
    nouveauRib: '',
    confirmerRib: ''
  };

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserRib();
  }

  loadUserRib(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non connecté'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.persoId = currentUser.persoId;
    this.loading = true;

    this.authService.getRibByPersoId(this.persoId).subscribe({
      next: (data) => {
        this.currentRib = { 
          rib: data.rib, 
          numRib: '1', 
          dateCreation: new Date().toISOString() 
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du RIB:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger votre RIB'
        });
        this.loading = false;
      }
    });
  }

  openModifyRibDialog(): void {
    if (!this.currentRib) return;
    
    this.displayModifyRibDialog = true;
    this.modifyRibForm = {
      ancienRib: this.currentRib.rib,
      nouveauRib: '',
      confirmerRib: ''
    };
  }

  closeModifyRibDialog(): void {
    this.displayModifyRibDialog = false;
    this.modifyRibForm = {
      ancienRib: '',
      nouveauRib: '',
      confirmerRib: ''
    };
  }

  validateRib(rib: string): boolean {
    const ribPattern = /^\d{20}$/;
    return ribPattern.test(rib.replace(/\s/g, ''));
  }

  formatRibDisplay(rib: string): string {
    if (!rib) return '';
    const cleanRib = rib.replace(/\s/g, '');
    return cleanRib.match(/.{1,4}/g)?.join(' ') || cleanRib;
  }

  submitModifyRib(): void {
    const cleanNouveauRib = this.modifyRibForm.nouveauRib.replace(/\s/g, '');
    const cleanConfirmerRib = this.modifyRibForm.confirmerRib.replace(/\s/g, '');

    // Validation
    if (!this.modifyRibForm.nouveauRib || !this.modifyRibForm.confirmerRib) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs'
      });
      return;
    }

    if (!this.validateRib(cleanNouveauRib)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Le nouveau RIB doit contenir exactement 20 chiffres'
      });
      return;
    }

    if (cleanNouveauRib !== cleanConfirmerRib) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les deux RIB ne correspondent pas'
      });
      return;
    }

    if (cleanNouveauRib === this.currentRib?.rib.replace(/\s/g, '')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Le nouveau RIB est identique à l\'ancien'
      });
      return;
    }

    // Envoi de la modification au backend
    this.authService.updateRib(this.persoId, cleanNouveauRib).subscribe({
      next: (response) => {
        this.currentRib = {
          rib: response.rib,
          numRib: this.currentRib?.numRib || '1',
          dateCreation: new Date().toISOString()
        };

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Votre RIB a été modifié avec succès'
        });
        
        this.closeModifyRibDialog();
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Impossible de modifier le RIB'
        });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToAccueil() {
  this.router.navigate(['/clients/accueil']);
}
}