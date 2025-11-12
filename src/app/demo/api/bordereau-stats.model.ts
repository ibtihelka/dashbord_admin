// bordereau-stats.model.ts

export interface BordereauSummary {
  refBordereau: string;
  dateBordereau: Date;
  nombreRemboursements: number;
  montantDepense: number;
  montantRembourse: number;
  tauxRemboursement: number;
}

export interface BordereauStats {
  // Informations de base
  refBordereau: string;
  dateBordereau: Date;
  site?: string;
  codeEntreprise?: string;
  
  // Statistiques générales
  totalRemboursements: number;
  montantTotalDepense: number;
  montantTotalRembourse: number;
  tauxRemboursementMoyen: number;
  
  // Répartition des bénéficiaires
  nombreAdherents: number;
  nombreConjoints: number;
  nombreEnfants: number;
  nombreParents: number;
  
  // Analyse financière
  montantMoyenRemboursement: number;
  montantMaxRemboursement: number;
  montantMinRemboursement: number;
  
  // Répartition des montants par type de bénéficiaire
  repartitionMontantsParType: { [key: string]: number };
  
  // Répartition par statut
  repartitionParStatut: { [key: string]: number };
  
  // Top adhérents
  topAdherents: TopAdherent[];
  
  // Statistiques démographiques
  repartitionParSexe: { [key: string]: number };
  moyenneAge: number;
  repartitionParTrancheAge: { [key: string]: number };
}

export interface TopAdherent {
  nomPrenPrest: string;
  nombreRemboursements: number;
  montantTotal: number;
}

export interface GlobalStats {
  totalBordereaux: number;
  totalDepense: number;
  totalRembourse: number;
  bordereaux: BordereauSummary[];
}