// prestataire.model.ts - Ajoutez ces interfaces

export interface Prestataire {
  persoId: string;
  nom: string;
  prenom: string;
  role: string;
  cin?: string;
  contact?: string;
  email?: string;
  adresse?: string;
  specialite?: string;
  persoPassed?: string; // Mot de passe
  persoLogin?: string; // Login/Username
   sexe?: string;
}

export interface RapportContreVisite {
  id?: string;
  prestataireId: string;
  beneficiaireId: string;
  beneficiaireNom: string;
  refBsPhys: string;
  typeRapport: string;
  observation: string;
  dateCreation?: Date | string;
  
  // Champs DENTISTE
  lignesDentaire?: string;
  
  // Champs OPTICIEN
  acuiteVisuelleOD?: string;
  acuiteVisuelleOG?: string;
  prixMonture?: number;
  natureVerres?: string;
  prixVerres?: number;
  
  // Champs optionnels supplémentaires
  employeur?: string;
  statut?: string;
}

export interface Beneficiaire {
  id: string;
  nom: string;
  type: 'USER' | 'CONJOINT' | 'ENFANT';
  dateNaissance?: Date | string;
}

export interface CreateRapportResponse {
  success: boolean;
  message: string;
  rapportId?: string;
  rapport?: RapportContreVisite;
}