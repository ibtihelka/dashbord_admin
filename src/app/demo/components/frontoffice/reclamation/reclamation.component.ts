// src/app/demo/components/client/reclamation/reclamation.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReclamationService, ReclamationCount } from 'src/app/demo/service/reclamation.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Reclamation, CreateReclamationRequest } from 'src/app/demo/api/reclamation.model';
import { User } from 'src/app/demo/api/login.model';
import { Remboursement } from 'src/app/demo/service/remboursement.service';

@Component({
  selector: 'app-reclamation',
  templateUrl: './reclamation.component.html',
  styleUrls: ['./reclamation.component.scss']
})
export class ReclamationComponent implements OnInit, OnDestroy {
  reclamationForm!: FormGroup;
  reclamations: Reclamation[] = [];
  remboursements: Remboursement[] = [];
  currentUser: User | null = null;
  
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  warningMessage = ''; // ✅ NOUVEAU : Pour afficher l'avertissement
  
  showForm = false;
  
  // ✅ NOUVEAU : Variables pour le comptage des réclamations
  selectedRefBsPhysCount: ReclamationCount | null = null;
  
  private userSubscription: Subscription = new Subscription();
  private routeSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private reclamationService: ReclamationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCurrentUser();
    
    // ✅ MODIFICATION : Afficher toujours le formulaire par défaut
    this.showForm = true;
    
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['refBsPhys']) {
        // Si refBsPhys est passé en paramètre, pré-remplir le champ
        this.reclamationForm.patchValue({
          refBsPhys: params['refBsPhys']
        });
        this.checkReclamationLimit(params['refBsPhys']);
      }
      // Sinon, le formulaire reste vide et ouvert
    });

    // ✅ NOUVEAU : Écouter les changements de sélection du BS
    this.reclamationForm.get('refBsPhys')?.valueChanges.subscribe(refBsPhys => {
      if (refBsPhys) {
        this.checkReclamationLimit(refBsPhys);
      } else {
        this.selectedRefBsPhysCount = null;
        this.warningMessage = '';
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  initForm() {
    this.reclamationForm = this.fb.group({
      refBsPhys: ['', Validators.required],
   
      texteReclamation: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadCurrentUser() {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        if (user) {
          this.loadRemboursements();
          this.loadReclamations();
        }
      }
    );
  }

  loadRemboursements() {
    if (!this.currentUser) return;

    this.reclamationService.getRemboursementsByUser(this.currentUser.persoId).subscribe({
      next: (data) => {
        this.remboursements = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des remboursements:', error);
        this.showError('Impossible de charger les remboursements');
      }
    });
  }

  loadReclamations() {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.reclamationService.getReclamationsByUser(this.currentUser.persoId).subscribe({
      next: (data) => {
        this.reclamations = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
        this.isLoading = false;
        this.showError('Impossible de charger les réclamations');
      }
    });
  }

  // ✅ NOUVELLE MÉTHODE : Vérifier la limite de réclamations
  checkReclamationLimit(refBsPhys: string) {
    this.reclamationService.getReclamationCount(refBsPhys).subscribe({
      next: (count) => {
        this.selectedRefBsPhysCount = count;
        
        if (count.count === 1) {
          this.showWarning(`⚠️ Attention : Vous avez déjà créé 1 réclamation pour ce remboursement. Il vous reste ${count.remaining} réclamation possible.`);
        } else if (count.count >= 2) {
          this.showWarning('🚫 Vous avez atteint la limite de 2 réclamations pour ce remboursement. Veuillez consulter votre responsable RH.');
        } else {
          this.warningMessage = '';
        }
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du nombre de réclamations:', error);
      }
    });
  }

  // ✅ MÉTHODE MISE À JOUR : Vérifier si le bouton submit doit être désactivé
  isSubmitDisabled(): boolean {
    return this.reclamationForm.invalid || 
           this.isSubmitting || 
           (this.selectedRefBsPhysCount !== null && !this.selectedRefBsPhysCount.canCreate);
  }

  onSubmit() {
    if (this.reclamationForm.invalid || !this.currentUser) {
      return;
    }

    // ✅ NOUVELLE VÉRIFICATION : Bloquer si la limite est atteinte
    if (this.selectedRefBsPhysCount && !this.selectedRefBsPhysCount.canCreate) {
      this.showError('Vous avez atteint la limite de réclamations pour ce remboursement. Veuillez consulter votre responsable RH.');
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const reclamationData: CreateReclamationRequest = {
      refBsPhys: this.reclamationForm.value.refBsPhys,
      persoId: this.currentUser.persoId,
      titreReclamation: this.reclamationForm.value.titreReclamation,
      texteReclamation: this.reclamationForm.value.texteReclamation
    };

    this.reclamationService.createReclamation(reclamationData).subscribe({
      next: (response) => {
        this.showSuccess('Réclamation enregistrée avec succès');
        this.resetForm();
        this.loadReclamations();
        this.isSubmitting = false;
        
        // Recharger le compteur
        if (this.reclamationForm.value.refBsPhys) {
          this.checkReclamationLimit(this.reclamationForm.value.refBsPhys);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création de la réclamation:', error);
        
        // ✅ GESTION SPÉCIALE : Si c'est l'erreur de limite
        if (error.status === 403 || error.error?.error?.includes('LIMITE_ATTEINTE')) {
          const message = error.error?.error?.replace('LIMITE_ATTEINTE:', '') || 
                         'Vous avez atteint la limite de réclamations pour ce remboursement. Veuillez consulter votre responsable RH.';
          this.showError(message);
        } else {
          this.showError(error.error?.error || 'Une erreur est survenue lors de l\'enregistrement');
        }
        
        this.isSubmitting = false;
      }
    });
  }

  canDeleteReclamation(reclamation: Reclamation): boolean {
    if (reclamation.responseRec && reclamation.responseRec.trim() !== '') {
      return false;
    }

    if (!reclamation.dateCreation) {
      return false;
    }

    try {
      const dateCreation = new Date(reclamation.dateCreation);
      const now = new Date();
      
      if (isNaN(dateCreation.getTime())) {
        console.error('Date invalide:', reclamation.dateCreation);
        return false;
      }
      
      const creationDay = dateCreation.getDate();
      const creationMonth = dateCreation.getMonth();
      const creationYear = dateCreation.getFullYear();
      
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const isSameDay = creationDay === currentDay &&
                        creationMonth === currentMonth &&
                        creationYear === currentYear;
      
      if (!isSameDay) {
        return false;
      }

      const currentHour = now.getHours();
      return currentHour < 20;
      
    } catch (error) {
      console.error('Erreur lors de la vérification de la date:', error);
      return false;
    }
  }

  getDeleteDisabledReason(reclamation: Reclamation): string {
    if (reclamation.responseRec && reclamation.responseRec.trim() !== '') {
      return 'Impossible de supprimer : une réponse a déjà été fournie';
    }

    if (!reclamation.dateCreation) {
      return 'Impossible de supprimer : date de création inconnue';
    }

    try {
      const dateCreation = new Date(reclamation.dateCreation);
      const now = new Date();
      
      if (isNaN(dateCreation.getTime())) {
        return 'Impossible de supprimer : date invalide';
      }
      
      const creationDay = dateCreation.getDate();
      const creationMonth = dateCreation.getMonth();
      const creationYear = dateCreation.getFullYear();
      
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const isSameDay = creationDay === currentDay &&
                        creationMonth === currentMonth &&
                        creationYear === currentYear;
      
      if (!isSameDay) {
        return 'Impossible de supprimer : délai de suppression dépassé (même jour avant 20h00)';
      }

      const currentHour = now.getHours();
      if (currentHour >= 20) {
        return 'Impossible de supprimer : il est après 20h00';
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la date:', error);
      return 'Impossible de supprimer : date invalide';
    }

    return '';
  }

  deleteReclamation(numReclamation: number) {
    const reclamation = this.reclamations.find(r => r.numReclamation === numReclamation);
    
    if (!reclamation) {
      this.showError('Réclamation introuvable');
      return;
    }

    if (!this.canDeleteReclamation(reclamation)) {
      const reason = this.getDeleteDisabledReason(reclamation);
      this.showError(reason);
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
      this.reclamationService.deleteReclamation(numReclamation).subscribe({
        next: () => {
          this.showSuccess('Réclamation supprimée avec succès');
          this.loadReclamations();
          
          // Recharger le compteur si un BS est sélectionné
          const refBsPhys = this.reclamationForm.value.refBsPhys;
          if (refBsPhys) {
            this.checkReclamationLimit(refBsPhys);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showError('Impossible de supprimer la réclamation');
        }
      });
    }
  }

  resetForm() {
    this.reclamationForm.reset();
    this.clearMessages();
    this.selectedRefBsPhysCount = null;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  }

  formatDateTime(date: any): string {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      
      return dateObj.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatDateTime:', error, 'pour date:', date);
      return 'N/A';
    }
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    this.warningMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  // ✅ NOUVELLE MÉTHODE : Afficher un avertissement
  showWarning(message: string) {
    this.warningMessage = message;
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.warningMessage = '';
  }

  goToAccueil() {
    this.router.navigate(['/clients/accueil']);
  }
}