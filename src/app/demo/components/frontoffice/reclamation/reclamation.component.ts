// src/app/demo/components/client/reclamation/reclamation.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReclamationService } from 'src/app/demo/service/reclamation.service';
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
  
  showForm = false;
  
  private userSubscription: Subscription = new Subscription();
  private routeSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private reclamationService: ReclamationService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCurrentUser();
    
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['refBsPhys']) {
        this.showForm = true;
        this.reclamationForm.patchValue({
          refBsPhys: params['refBsPhys']
        });
      } else {
        this.showForm = false;
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
      titreReclamation: ['', Validators.required],
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
        
        // Debug: afficher le format de la date
        if (data.length > 0 && data[0].dateCreation) {
          console.log('📅 Format de date reçu du backend:', data[0].dateCreation);
          console.log('📅 Type:', typeof data[0].dateCreation);
          console.log('📅 Date convertie:', new Date(data[0].dateCreation));
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
        this.isLoading = false;
        this.showError('Impossible de charger les réclamations');
      }
    });
  }

  onSubmit() {
    if (this.reclamationForm.invalid || !this.currentUser) {
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
      },
      error: (error) => {
        console.error('Erreur lors de la création de la réclamation:', error);
        this.showError(error.error?.error || 'Une erreur est survenue lors de l\'enregistrement');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Vérifie si l'utilisateur peut supprimer une réclamation
   * Règles:
   * 1. Si la réclamation a une réponse -> NON
   * 2. Si la réclamation a été créée le même jour et il est avant 20h00 -> OUI
   * 3. Sinon -> NON
   */
  canDeleteReclamation(reclamation: Reclamation): boolean {
    // Règle 1: Si la réclamation a une réponse, on ne peut pas la supprimer
    if (reclamation.responseRec && reclamation.responseRec.trim() !== '') {
      return false;
    }

    // Vérifier que dateCreation existe
    if (!reclamation.dateCreation) {
      return false;
    }

    try {
      // Parser la date de création
      const dateCreation = new Date(reclamation.dateCreation);
      const now = new Date();
      
      // Vérifier si la date est valide
      if (isNaN(dateCreation.getTime())) {
        console.error('Date invalide:', reclamation.dateCreation);
        return false;
      }
      
      // Comparer les dates (jour, mois, année)
      const creationDay = dateCreation.getDate();
      const creationMonth = dateCreation.getMonth();
      const creationYear = dateCreation.getFullYear();
      
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Règle 2: Vérifier si c'est le même jour
      const isSameDay = creationDay === currentDay &&
                        creationMonth === currentMonth &&
                        creationYear === currentYear;
      
      if (!isSameDay) {
        return false;
      }

      // Vérifier si l'heure actuelle est avant 20h00
      const currentHour = now.getHours();
      return currentHour < 20;
      
    } catch (error) {
      console.error('Erreur lors de la vérification de la date:', error);
      return false;
    }
  }

  /**
   * Retourne un message expliquant pourquoi la suppression n'est pas autorisée
   */
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
      
      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      
      // Formater en heure locale française
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

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}