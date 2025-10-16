import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Suggestion, SuggestionService } from 'src/app/demo/service/suggestion.service';



@Component({
  selector: 'app-mes-suggestions',
  templateUrl: './mes-suggestions.component.html',
  styleUrls: ['./mes-suggestions.component.scss'],
  providers: [MessageService]
})
export class MesSuggestionsComponent implements OnInit {
  suggestions: Suggestion[] = [];
  loading: boolean = true;
  persoId: string = '';
  displayNewSuggestionDialog: boolean = false;
  
  newSuggestion = {
    titreSuggestion: '',
    texteSuggestion: ''
  };

  constructor(
    private authService: AuthService,
    private suggestionService: SuggestionService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserSuggestions();
  }

  loadUserSuggestions(): void {
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

    this.suggestionService.getSuggestionsByPersoId(this.persoId).subscribe({
      next: (data) => {
        this.suggestions = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des suggestions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos suggestions'
        });
        this.loading = false;
      }
    });
  }

  openNewSuggestionDialog(): void {
    this.displayNewSuggestionDialog = true;
    this.newSuggestion = {
      titreSuggestion: '',
      texteSuggestion: ''
    };
  }

  closeNewSuggestionDialog(): void {
    this.displayNewSuggestionDialog = false;
  }

  submitNewSuggestion(): void {
    if (!this.newSuggestion.titreSuggestion || !this.newSuggestion.texteSuggestion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs'
      });
      return;
    }

    const suggestionData = {
      ...this.newSuggestion,
      persoId: this.persoId
    };

    this.suggestionService.createSuggestion(suggestionData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Suggestion créée avec succès'
        });
        this.closeNewSuggestionDialog();
        this.loadUserSuggestions();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer la suggestion'
        });
      }
    });
  }

  getStatusBadge(exported: string): string {
    return exported === 'OUI' ? 'success' : 'warning';
  }

  getStatusText(exported: string): string {
    return exported === 'OUI' ? 'Traitée' : 'En attente';
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
}