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
  typeRapport: string; // 'DENTISTE' | 'OPTICIEN'
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
  loading = false;
  displayDialog = false;
  selectedRapport?: Rapport;
  prestataireId = '';

  constructor(
    private messageService: MessageService,
    private rapportService: RapportContreVisiteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentPrestataire = this.authService.getCurrentPrestataire();
    if (currentPrestataire?.persoId) {
      this.prestataireId = currentPrestataire.persoId;
      this.loadRapports();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Session utilisateur non trouvée.' });
    }
  }

  loadRapports(): void {
    if (!this.prestataireId) return;

    this.loading = true;
    this.rapportService.getRapportsParPrestataire(this.prestataireId).subscribe({
      next: (data: RapportContreVisite[]) => {
        this.rapports = data.map(r => ({
          id: r.id,
          dateRapport: r.dateRapport ? new Date(r.dateRapport) : new Date(),
          refBsPhys: r.refBsPhys,
          beneficiaireNom: r.beneficiaireNom,
          
          typeRapport: r.typeRapport,
          observation: r.observation,
          lignesDentaire: r.lignesDentaire,
          acuiteVisuelleOD: r.acuiteVisuelleOD,
          acuiteVisuelleOG: r.acuiteVisuelleOG,
          prixMonture: r.prixMonture,
          natureVerres: r.natureVerres,
          prixVerres: r.prixVerres
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Erreur chargement rapports:', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les rapports.' });
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
      try { return JSON.parse(lignes); } 
      catch { return []; }
    }
    return lignes;
  }

  formatCurrency(value?: number): string {
    return value != null ? value.toFixed(2) + ' DT' : '-';
  }
}
