export interface Reclamation {
  numReclamation?: number;
  refBsPhys: string;
  persoId: string;
  titreReclamation: string;
  texteReclamation: string;
  responseRec?: string;
  exported?: string;
  dateCreation?: Date;
  nomPrenPrest?: string;
  datBs?: Date;
}

export interface CreateReclamationRequest {
  refBsPhys: string;
  persoId: string;
  titreReclamation: string;
  texteReclamation: string;
}