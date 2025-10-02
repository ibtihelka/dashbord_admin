import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Remboursement {
  refBsPhys: string;
  persoId: string;
  nomPrenPrest: string;
  datBs: Date;
  mntBs: number;
  mntBsRemb: number;
  statBs: string;
  refBorderau: string;
  site: string;
  desSit: string;
  codeEntreprise: string;
  observation: string;
  dateBordereau: Date;
}

// Interface pour les statistiques du dashboard
export interface RemboursementStats {
  totalRemboursements: number;
  montantTotalRemb: number;
  repartitionParMois: { [mois: string]: number };
  repartitionParStatut: { [statut: string]: number };
  derniersRemboursements: Remboursement[];
}

@Injectable({
  providedIn: 'root'
})
export class RemboursementService {
  private apiUrl = 'http://localhost:8096/api/remboursements';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  // ==========================================
  // MÉTHODES EXISTANTES (FRONT-OFFICE)
  // ==========================================

  // Récupérer tous les remboursements
  getAllRemboursements(): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(this.apiUrl, this.getHttpOptions());
  }

  // Récupérer un remboursement par ID
  getRemboursementById(id: string): Observable<Remboursement> {
    return this.http.get<Remboursement>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Récupérer les remboursements de l'utilisateur connecté
  getMyRemboursements(): Observable<Remboursement[]> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    const url = `${this.apiUrl}/user/${currentUser.persoId}`;
    console.log('Appel API pour récupérer les remboursements de:', currentUser.persoId);
    console.log('URL complète:', url);
    
    return this.http.get<Remboursement[]>(url, this.getHttpOptions());
  }

  // Récupérer les remboursements par persoId (méthode générique)
  getRemboursementsByPersoId(persoId: string): Observable<Remboursement[]> {
    const url = `${this.apiUrl}/user/${persoId}`;
    console.log('Appel API pour persoId:', persoId, 'URL:', url);
    return this.http.get<Remboursement[]>(url, this.getHttpOptions());
  }

  // Récupérer les remboursements par statut
  getRemboursementsByStatus(status: string): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(`${this.apiUrl}/status/${status}`, this.getHttpOptions());
  }

  // Récupérer les remboursements par bordereau
  getRemboursementsByBordereau(refBordereau: string): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(`${this.apiUrl}/bordereau/${refBordereau}`, this.getHttpOptions());
  }

  // Méthodes utilitaires
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // ==========================================
  // NOUVELLES MÉTHODES POUR LE DASHBOARD
  // ==========================================

  /**
   * Récupérer les remboursements filtrés par entreprise
   * Utilisé dans le dashboard pour les statistiques par entreprise
   */
  getRemboursementsByEntreprise(codeEntreprise: string): Observable<Remboursement[]> {
    return this.getAllRemboursements().pipe(
      map(remboursements => 
        remboursements.filter(r => r.codeEntreprise === codeEntreprise)
      )
    );
  }

  /**
   * Récupérer la liste unique des codes entreprises
   * Pour alimenter le dropdown de sélection
   */
  getEntreprises(): Observable<string[]> {
    return this.getAllRemboursements().pipe(
      map(remboursements => {
        const entreprises = [...new Set(remboursements.map(r => r.codeEntreprise))];
        return entreprises.filter(e => e != null && e !== '');
      })
    );
  }

  /**
   * Calculer les statistiques à partir d'une liste de remboursements
   * Utilisé pour générer les graphiques et KPIs du dashboard
   */
  calculateStats(remboursements: Remboursement[], annee?: number): RemboursementStats {
    const stats: RemboursementStats = {
      totalRemboursements: remboursements.length,
      montantTotalRemb: 0,
      repartitionParMois: {},
      repartitionParStatut: {},
      derniersRemboursements: []
    };

    // Calcul du montant total remboursé
    stats.montantTotalRemb = remboursements.reduce((sum, r) => 
      sum + (r.mntBsRemb || 0), 0
    );

    // Répartition par mois (pour le graphique linéaire)
    // Filtrer par année si spécifiée
    const remboursmentsAnnee = annee 
      ? remboursements.filter(r => {
          if (!r.datBs) return false;
          return new Date(r.datBs).getFullYear() === annee;
        })
      : remboursements;

    // Initialiser tous les mois de l'année avec 0
    const moisOrdonnes = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    moisOrdonnes.forEach(mois => {
      stats.repartitionParMois[mois] = 0;
    });

    // Compter les remboursements par mois
    remboursmentsAnnee.forEach(r => {
      if (r.datBs) {
        const date = new Date(r.datBs);
        const moisIndex = date.getMonth();
        const nomMois = moisOrdonnes[moisIndex];
        stats.repartitionParMois[nomMois]++;
      }
    });

    // Répartition par statut (pour le graphique doughnut)
    remboursements.forEach(r => {
      const statut = r.statBs || 'Non défini';
      stats.repartitionParStatut[statut] = (stats.repartitionParStatut[statut] || 0) + 1;
    });

    // Les 5 derniers remboursements (pour le tableau)
    stats.derniersRemboursements = [...remboursements]
      .sort((a, b) => {
        const dateA = new Date(a.datBs).getTime();
        const dateB = new Date(b.datBs).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    return stats;
  }

  /**
   * Obtenir les années disponibles dans les remboursements
   */
  getAnneesDisponibles(remboursements: Remboursement[]): number[] {
    const annees = new Set<number>();
    remboursements.forEach(r => {
      if (r.datBs) {
        annees.add(new Date(r.datBs).getFullYear());
      }
    });
    return Array.from(annees).sort((a, b) => b - a); // Tri décroissant
  }

  /**
   * Compter les remboursements du mois en cours
   * Pour la carte "nouveaux remboursements" du dashboard
   */
  countRemboursementsMoisCourant(remboursements: Remboursement[]): number {
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    
    return remboursements.filter(r => {
      if (!r.datBs) return false;
      const dateRemb = new Date(r.datBs);
      return dateRemb >= debutMois;
    }).length;
  }

  /**
   * Obtenir les statistiques globales (tous les remboursements)
   * Pour les cartes du dashboard principal
   */
  getGlobalStats(): Observable<{total: number, nouveaux: number}> {
    return this.getAllRemboursements().pipe(
      map(remboursements => ({
        total: remboursements.length,
        nouveaux: this.countRemboursementsMoisCourant(remboursements)
      }))
    );
  }

  /**
   * Obtenir les statistiques complètes par entreprise
   * Combine les données et les statistiques calculées
   */
  getStatsByEntreprise(codeEntreprise: string): Observable<RemboursementStats> {
    return this.getRemboursementsByEntreprise(codeEntreprise).pipe(
      map(remboursements => this.calculateStats(remboursements))
    );
  }

  /**
   * Formater un montant en devise (TND)
   * Utilitaire pour l'affichage dans les templates
   */
  formatCurrency(montant: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant);
  }

  /**
   * Calculer le pourcentage
   * Utilitaire pour les graphiques
   */
  calculatePercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}