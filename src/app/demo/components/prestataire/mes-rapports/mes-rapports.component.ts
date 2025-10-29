import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RapportContreVisiteService, RapportContreVisite } from 'src/app/demo/service/rapport-contre-visite.service';
import { AuthService } from 'src/app/demo/service/auth.service';

interface Rapport {
  id?: number;
  dateRapport: Date;
  refBsPhys: string;
  beneficiaireNom: string;
  typeBeneficiaire?: string;
  typeRapport: string; // Changé de 'DENTISTE' | 'OPTICIEN' à string
  observation?: string;
  lignesDentaire?: string;
  acuiteVisuelleOD?: string;
  acuiteVisuelleOG?: string;
  prixMonture?: number;
  natureVerres?: string;
  prixVerres?: number;
}

@Component({
  selector: 'app-mes-rapports',
  templateUrl: './mes-rapports.component.html',
  styleUrls: ['./mes-rapports.component.scss'],
  providers: [MessageService]
})
export class MesRapportsComponent implements OnInit {
  rapports: Rapport[] = [];
  loading: boolean = false;
  displayDialog: boolean = false;
  selectedRapport?: Rapport;
  prestataireId: string = '';

  constructor(
    private messageService: MessageService,
    private rapportService: RapportContreVisiteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du prestataire connecté depuis la session
    const currentPrestataire = this.authService.getCurrentPrestataire();
    
    if (currentPrestataire && currentPrestataire.persoId) {
      this.prestataireId = currentPrestataire.persoId;
      this.loadRapports();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Session utilisateur non trouvée. Veuillez vous reconnecter.'
      });
    }
  }

  loadRapports(): void {
    if (!this.prestataireId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'ID prestataire non disponible'
      });
      return;
    }

    this.loading = true;
    
    this.rapportService.getRapportsParPrestataire(this.prestataireId).subscribe({
      next: (data: RapportContreVisite[]) => {
        this.rapports = data.map(rapport => ({
          id: rapport.id,
          dateRapport: rapport.dateRapport ? new Date(rapport.dateRapport) : new Date(),
          refBsPhys: rapport.refBsPhys,
          beneficiaireNom: rapport.beneficiaireNom,
          typeBeneficiaire: rapport.typeBeneficiaire,
          typeRapport: rapport.typeRapport,
          observation: rapport.observation,
          lignesDentaire: rapport.lignesDentaire,
          acuiteVisuelleOD: rapport.acuiteVisuelleOD,
          acuiteVisuelleOG: rapport.acuiteVisuelleOG,
          prixMonture: rapport.prixMonture,
          natureVerres: rapport.natureVerres,
          prixVerres: rapport.prixVerres
        }));
        
        this.loading = false;
        
        if (this.rapports.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Information',
            detail: 'Aucun rapport trouvé'
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `${this.rapports.length} rapport(s) chargé(s)`
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rapports:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les rapports'
        });
      }
    });
  }

  viewDetails(rapport: Rapport): void {
    this.selectedRapport = rapport;
    this.displayDialog = true;
  }

  getSeverity(type?: string): string {
    if (!type) return 'warning';
    
    switch (type.toUpperCase()) {
      case 'PHYSIQUE': return 'success';
      case 'MORAL': return 'info';
      default: return 'warning';
    }
  }

  parseLignesDentaire(lignes: string | any[]): any[] {
    if (!lignes) return [];
    
    if (typeof lignes === 'string') {
      try {
        return JSON.parse(lignes);
      } catch (e) {
        console.error('Erreur lors du parsing des lignes dentaires:', e);
        return [];
      }
    }
    
    return lignes;
  }

  formatCurrency(value?: number): string {
    return value != null ? value.toFixed(2) + ' DT' : '-';
  }
}