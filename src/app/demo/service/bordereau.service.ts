import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bordereau, Remboursement } from '../api/societe.model';
import { BordereauStats, BordereauSummary } from '../api/bordereau-stats.model';
import { FamilleService, Famille } from './famille.service';

@Injectable({
  providedIn: 'root'
})
export class BordereauService {
  private baseUrl = 'http://localhost:8096/api/bordereaux';

  constructor(
    private http: HttpClient,
    private familleService: FamilleService
  ) {}

  getAllBordereaux(): Observable<Bordereau[]> {
    return this.http.get<Bordereau[]>(this.baseUrl);
  }

  getBordereauxByPrefix(prefix: string): Observable<Bordereau[]> {
    const params = new HttpParams().set('prefix', prefix);
    return this.http.get<Bordereau[]>(`${this.baseUrl}/by-prefix`, { params });
  }

  getBordereauAvecRemboursements(refBordereau: string): Observable<Bordereau> {
    return this.http.get<Bordereau>(`${this.baseUrl}/${refBordereau}`);
  }

  getGlobalBordereauxStats(prefix?: string): Observable<{
    totalBordereaux: number;
    totalDepense: number;
    totalRembourse: number;
    bordereaux: BordereauSummary[];
  }> {
    const source$ = prefix
      ? this.getBordereauxByPrefix(prefix)
      : this.getAllBordereaux();

    return source$.pipe(
      map(bordereaux => {
        const summaries: BordereauSummary[] = bordereaux.map(b => {
          const remboursements = b.remboursements || [];
          const depense = remboursements.reduce((sum, r) =>
            sum + (Number(r.mntBs) || 0), 0);
          const rembourse = remboursements.reduce((sum, r) =>
            sum + (Number(r.mntBsRemb) || 0), 0);

          return {
            refBordereau: b.refBordereau,
            dateBordereau: new Date(b.dateBordereau),
            nombreRemboursements: remboursements.length,
            montantDepense: depense,
            montantRembourse: rembourse,
            tauxRemboursement: depense > 0 ? (rembourse / depense) * 100 : 0
          };
        });

        return {
          totalBordereaux: bordereaux.length,
          totalDepense: summaries.reduce((sum, s) => sum + s.montantDepense, 0),
          totalRembourse: summaries.reduce((sum, s) => sum + s.montantRembourse, 0),
          bordereaux: summaries
        };
      })
    );
  }

 calculateBordereauStats(bordereau: Bordereau, familles: Famille[]): BordereauStats {
  const remboursements = bordereau.remboursements || [];

  // Créer une map pour retrouver rapidement les familles par persoId et prénom
  const familleMap = new Map<string, Map<string, Famille>>();
  familles.forEach(famille => {
    if (!familleMap.has(famille.persoId)) {
      familleMap.set(famille.persoId, new Map<string, Famille>());
    }
    familleMap.get(famille.persoId)!.set(famille.prenomPrestataire.toLowerCase(), famille);
  });

  // 1. Statistiques de base
  const montantTotalDepense = remboursements.reduce((sum, r) => sum + (Number(r.mntBs) || 0), 0);
  const montantTotalRembourse = remboursements.reduce((sum, r) => sum + (Number(r.mntBsRemb) || 0), 0);
  const tauxRemboursementMoyen = montantTotalDepense > 0
    ? (montantTotalRembourse / montantTotalDepense) * 100
    : 0;

  // 2. Répartition des bénéficiaires
  let nombreAdherents = 0;
  let nombreConjoints = 0;
  let nombreEnfants = 0;
  let nombreParents = 0;

  const repartitionMontantsParType: { [type: string]: number } = {
    'Adhérent': 0,
    'Conjoint': 0,
    'Enfant': 0,
    'Parent': 0
  };

  const repartitionParStatut: { [statut: string]: number } = {};
  const repartitionParSexe: { [sexe: string]: number } = {};
  const ages: number[] = [];

  remboursements.forEach(r => {
    const montantRemb = Number(r.mntBsRemb) || 0;
    const statut = r.statBs || 'Non défini';
    repartitionParStatut[statut] = (repartitionParStatut[statut] || 0) + 1;

    // Déterminer le type de bénéficiaire
    const nomPrestataire = r.nomPrenPrest?.toLowerCase() || '';
    const persoId = r.persoId || '';

    // Trouver la famille associée
    const famillesUser = familleMap.get(persoId);
    let famille: Famille | undefined;

    if (famillesUser) {
      famille = famillesUser.get(nomPrestataire);
    }

    if (famille) {
      switch (famille.typPrestataire) {
        case 'CONJOINT':
        case 'Conjoint':
          nombreConjoints++;
          repartitionMontantsParType['Conjoint'] += montantRemb;
          break;
        case 'ENFANT':
        case 'Enfant':
          nombreEnfants++;
          repartitionMontantsParType['Enfant'] += montantRemb;
          break;
        case 'PERE':
        case 'MERE':
        case 'Père':
        case 'Mère':
          nombreParents++;
          repartitionMontantsParType['Parent'] += montantRemb;
          break;
        default:
          nombreAdherents++;
          repartitionMontantsParType['Adhérent'] += montantRemb;
      }

      // Sexe
      const sexe = famille.sexe || 'Non défini';
      repartitionParSexe[sexe] = (repartitionParSexe[sexe] || 0) + 1;

      // Âge
      if (famille.datNais) {
        const naissance = new Date(famille.datNais);
        const age = new Date().getFullYear() - naissance.getFullYear();
        ages.push(age);
      }
    } else {
      // Si pas de famille trouvée, c'est l'adhérent lui-même
      nombreAdherents++;
      repartitionMontantsParType['Adhérent'] += montantRemb;
    }
  });

  // 3. Analyse financière
  const montants = remboursements.map(r => Number(r.mntBsRemb) || 0).filter(m => m > 0);
  const montantMoyenRemboursement = montants.length > 0
    ? montants.reduce((sum, m) => sum + m, 0) / montants.length
    : 0;
  const montantMaxRemboursement = montants.length > 0 ? Math.max(...montants) : 0;
  const montantMinRemboursement = montants.length > 0 ? Math.min(...montants) : 0;

  // 4. Top adhérents
  const adherentMap = new Map<string, { nombre: number; montant: number }>();
  remboursements.forEach(r => {
    const nom = r.nomPrenPrest || 'Inconnu';
    const montant = Number(r.mntBsRemb) || 0;

    if (!adherentMap.has(nom)) {
      adherentMap.set(nom, { nombre: 0, montant: 0 });
    }
    const stats = adherentMap.get(nom)!;
    stats.nombre++;
    stats.montant += montant;
  });

  const topAdherents = Array.from(adherentMap.entries())
    .map(([nom, stats]) => ({
      nomPrenPrest: nom,
      nombreRemboursements: stats.nombre,
      montantTotal: stats.montant
    }))
    .sort((a, b) => b.montantTotal - a.montantTotal)
    .slice(0, 5);

  // 5. Répartition par tranche d'âge
  const repartitionParTrancheAge: { [tranche: string]: number } = {
    '0-17': 0,
    '18-35': 0,
    '36-50': 0,
    '51-65': 0,
    '66+': 0
  };

  ages.forEach(age => {
    if (age <= 17) repartitionParTrancheAge['0-17']++;
    else if (age <= 35) repartitionParTrancheAge['18-35']++;
    else if (age <= 50) repartitionParTrancheAge['36-50']++;
    else if (age <= 65) repartitionParTrancheAge['51-65']++;
    else repartitionParTrancheAge['66+']++;
  });

  const moyenneAge = ages.length > 0
    ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
    : 0;

  // Logs pour vérifier les données
  console.log('👨‍👩‍👧‍👦 Données graphique bénéficiaires:', {
    labels: ['Adhérents', 'Conjoints', 'Enfants', 'Parents'],
    data: [nombreAdherents, nombreConjoints, nombreEnfants, nombreParents]
  });

  console.log('💰 Données graphique montants:', {
    labels: Object.keys(repartitionMontantsParType),
    data: Object.values(repartitionMontantsParType)
  });

  console.log('📊 Données graphique statuts:', {
    labels: Object.keys(repartitionParStatut),
    data: Object.values(repartitionParStatut)
  });

  console.log('👨‍👩‍👧‍👦 Données graphique âges:', {
    labels: Object.keys(repartitionParTrancheAge),
    data: Object.values(repartitionParTrancheAge)
  });

  return {
    refBordereau: bordereau.refBordereau,
    dateBordereau: new Date(bordereau.dateBordereau),
    totalRemboursements: remboursements.length,
    montantTotalDepense,
    montantTotalRembourse,
    tauxRemboursementMoyen,
    nombreAdherents,
    nombreConjoints,
    nombreEnfants,
    nombreParents,
    montantMoyenRemboursement,
    montantMaxRemboursement,
    montantMinRemboursement,
    repartitionMontantsParType,
    repartitionParStatut,
    repartitionParSexe,
    moyenneAge,
    repartitionParTrancheAge,
    topAdherents,
    site: bordereau.site,
    codeEntreprise: bordereau.codeEntreprise
  };
}


  getBordereauStats(refBordereau: string): Observable<BordereauStats> {
    return forkJoin({
      bordereau: this.getBordereauAvecRemboursements(refBordereau),
      familles: this.familleService.getAllFamilles()
    }).pipe(
      map(({ bordereau, familles }) => {
        console.log('Bordereau reçu :', bordereau);
        console.log('Familles reçues :', familles);
        return this.calculateBordereauStats(bordereau, familles);
      })
    );
  }

  formatCurrency(montant: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant);
  }
}
