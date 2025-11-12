export interface FamilleStats {
  totalFamilles: number;
  repartitionParType: { [key: string]: number };
  repartitionParSexe: { [key: string]: number };
  moyenneAge: number;
  repartitionParTrancheAge: { [key: string]: number };
}

export interface BordereauDashboard {
  refBordereau: string;
  dateBordereau: Date;
  montantDepense: number;
  montantRembourse: number;
  familleStats: FamilleStats;
}
