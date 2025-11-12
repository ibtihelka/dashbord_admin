// src/app/demo/api/societe.model.ts

export interface Bordereau {
  refBordereau: string;  // Clé primaire - correspond à REF_BORDEREAU dans la BDD
  dateBordereau: Date | string;
  site?: string;
  codeEntreprise?: string;
  remboursements?: Remboursement[];
}

export interface Remboursement {
  refBsPhys: string;  // Clé primaire
  persoId?: string;
  numBulletin?: string;
  nomPrenPrest?: string;
  
  // Dates
  datBs?: Date | string;
  dateReception?: Date | string;
  dateBordereau?: Date | string;
  
  // Personnes
  adherent?: string;
  beneficiaire?: string;
  
  // Montants (support des deux formats)
  montantDepense?: number;
  mntBs?: number;
  montantRembourse?: number;
  mntBsRemb?: number;
  
  // Statut
  statut?: string;
  statBs?: string;
  
  // Informations complémentaires
  observation?: string;
  reclamations?: string;
  refBordereau?: string;
  site?: string;
  desSit?: string;
  codeEntreprise?: string;
}

export interface UsersSociete {
  persoId: string;
  persoName?: string;
  persoPassed?: string;
  contact?: string;
  email?: string;
  role?: string;
}