import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service';
import { BordereauService } from 'src/app/demo/service/bordereau.service';
import { Bordereau, Remboursement } from 'src/app/demo/api/societe.model';

@Component({
  selector: 'app-societe-bordereaux',
  templateUrl: './societe-bordereaux.component.html',
  styleUrls: ['./societe-bordereaux.component.scss']
})
export class SocieteBordereauxComponent implements OnInit {
  bordereaux: Bordereau[] = [];
  selectedBordereau: Bordereau | null = null;
  loading = false;
  societePrefix = '';
  totalDepense = 0;
  totalRembourse = 0;

  displayColumns = [
    { field: 'refBordereau', header: 'Ref Bordereau' },
    { field: 'numBulletin', header: 'N° Bulletin de soins' },
    { field: 'dateReception', header: 'Date de réception' },
    { field: 'adherent', header: 'Adhérent' },
    { field: 'beneficiaire', header: 'Bénéficiaire' },
    { field: 'montantDepense', header: 'Montant dépensé' },
    { field: 'montantRembourse', header: 'Montant remboursé' },
    { field: 'statut', header: 'Statut' },
    { field: 'observation', header: 'Observation' },
    { field: 'reclamations', header: 'Réclamations' },
    { field: 'actions', header: 'Détails' }
  ];

  constructor(
    private authService: AuthService,
    private bordereauService: BordereauService
  ) {}

  ngOnInit(): void {
    const societe = this.authService.getCurrentSociete();
    console.log('🔍 Société connectée:', societe);
    
    if (societe && societe.persoId) {
      // Extraire le préfixe (STAFIM, TP, etc.)
      this.societePrefix = this.extractPrefix(societe.persoId);
      console.log('🏢 Préfixe extrait:', this.societePrefix);
      this.loadBordereaux();
    } else {
      console.error('❌ Aucune société connectée');
    }
  }

  private extractPrefix(persoId: string): string {
    // Extraire tout avant le premier underscore ou tiret
    // Exemples: "STAFIM-2024" → "STAFIM", "TP_USER1" → "TP"
    const match = persoId.match(/^([^_-]+)/);
    const prefix = match ? match[1] : persoId;
    console.log(`📋 Extraction: "${persoId}" → "${prefix}"`);
    return prefix;
  }

  loadBordereaux(): void {
    this.loading = true;
    console.log(`🔄 Chargement des bordereaux pour préfixe: ${this.societePrefix}`);
    
    // Utiliser l'endpoint optimisé avec le préfixe
    this.bordereauService.getBordereauxByPrefix(this.societePrefix).subscribe({
      next: (data) => {
        this.bordereaux = data;
        console.log(`✅ ${data.length} bordereau(x) chargé(s):`, data);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des bordereaux:', err);
        this.loading = false;
      }
    });
  }

  viewDetails(refBordereau: string): void {
    console.log('👁️ Affichage des détails du bordereau:', refBordereau);
    this.bordereauService.getBordereauAvecRemboursements(refBordereau).subscribe({
      next: (bordereau) => {
        this.selectedBordereau = bordereau;
        this.calculateTotals(bordereau.remboursements || []);
        console.log('✅ Détails chargés:', bordereau);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des détails:', err);
      }
    });
  }

  // Méthodes pour calculer les totaux (compatible avec les deux formats)
  getTotalDepense(remboursements: Remboursement[]): number {
    if (!remboursements || remboursements.length === 0) return 0;
    return remboursements.reduce((sum, r) => {
      const montant = r.montantDepense || r.mntBs || 0;
      return sum + (typeof montant === 'number' ? montant : 0);
    }, 0);
  }

  getTotalRembourse(remboursements: Remboursement[]): number {
    if (!remboursements || remboursements.length === 0) return 0;
    return remboursements.reduce((sum, r) => {
      const montant = r.montantRembourse || r.mntBsRemb || 0;
      return sum + (typeof montant === 'number' ? montant : 0);
    }, 0);
  }

  private calculateTotals(remboursements: Remboursement[]): void {
    this.totalDepense = this.getTotalDepense(remboursements);
    this.totalRembourse = this.getTotalRembourse(remboursements);
  }

  closeDetails(): void {
    this.selectedBordereau = null;
    this.totalDepense = 0;
    this.totalRembourse = 0;
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '0 TND';
    return `${amount.toLocaleString('fr-FR')} TND`;
  }
}