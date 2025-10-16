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
  alreadyHasReclamation = false;
  successMessage = '';
  errorMessage = '';
  
  // Nouvelle propriété pour contrôler l'affichage du formulaire
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
    
    // Écouter les paramètres de requête pour savoir si on vient de la page remboursements
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['refBsPhys']) {
        // Si on a un refBsPhys, afficher le formulaire et le pré-remplir
        this.showForm = true;
        this.reclamationForm.patchValue({
          refBsPhys: params['refBsPhys']
        });
        // Vérifier si une réclamation existe déjà
        this.checkIfReclamationExists(params['refBsPhys']);
      } else {
        // Sinon, afficher seulement la liste
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
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
        this.isLoading = false;
        this.showError('Impossible de charger les réclamations');
      }
    });
  }

  onRemboursementSelect(event: any) {
    const refBsPhys = event.target.value;
    if (refBsPhys) {
      this.checkIfReclamationExists(refBsPhys);
    } else {
      this.alreadyHasReclamation = false;
    }
  }

  checkIfReclamationExists(refBsPhys: string) {
    this.reclamationService.hasReclamation(refBsPhys).subscribe({
      next: (response) => {
        this.alreadyHasReclamation = response.exists;
        if (this.alreadyHasReclamation) {
          this.showError('Une réclamation existe déjà pour ce bulletin de soins');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la vérification:', error);
      }
    });
  }

  onSubmit() {
    if (this.reclamationForm.invalid || !this.currentUser || this.alreadyHasReclamation) {
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

  deleteReclamation(numReclamation: number) {
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
    this.alreadyHasReclamation = false;
    this.clearMessages();
  }

  // Nouvelle méthode pour afficher le formulaire
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