import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RapportContreVisite {
  id?: number;
  prestataireId: string;
  beneficiaireId: string;
  beneficiaireNom: string;
  typeRapport: string;
  refBsPhys: string;
  observation: string;
  dateRapport?: Date;
  lignesDentaire?: string;
  acuiteVisuelleOD?: string;
  acuiteVisuelleOG?: string;
  prixMonture?: number;
  natureVerres?: string;
  prixVerres?: number;
}

export interface LigneDentaire {
  dent: string;
  codeActe: string;
  cotation: string;
  avisMedical: string;
}

export interface Beneficiaire {
  id: string;
  nom: string;
  type: string;
}

export interface Remboursement {
  refBsPhys: string;
  persoId: string;
  nomPrenPrest: string;
  datBs: Date;
  mntBs: number;
  mntBsRemb: number;
  statBs: string;
}

export interface Adherent {
  persoId: string;
  cin: string; // ✅ Utiliser CIN comme matricule
  persoName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RapportContreVisiteService {
  private apiUrl = 'http://localhost:8096/api/rapports';

  constructor(private http: HttpClient) {}

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  // ✅ Récupérer tous les adhérents
  getAllAdherents(): Observable<Adherent[]> {
    return this.http.get<Adherent[]>(`${this.apiUrl}/adherents`, this.getHttpOptions());
  }

  // ✅ Récupérer les remboursements par CIN (matricule)
  getRemboursementsByMatricule(cin: string): Observable<Remboursement[]> {
    // D'abord récupérer l'adhérent pour obtenir son persoId
    return this.http.get<Remboursement[]>(
      `${this.apiUrl}/remboursements-by-cin/${cin}`,
      this.getHttpOptions()
    );
  }

  // ✅ Récupérer les bénéficiaires d'un bulletin de soins
  getBeneficiaires(refBsPhys: string): Observable<{ beneficiaires: Beneficiaire[] }> {
    return this.http.get<{ beneficiaires: Beneficiaire[] }>(
      `${this.apiUrl}/beneficiaires/${refBsPhys}`,
      this.getHttpOptions()
    );
  }

 getBeneficiaire(refBsPhys: string): Observable<{ success: boolean, beneficiaire: Beneficiaire }> {
  return this.http.get<{ success: boolean, beneficiaire: Beneficiaire }>(
    `${this.apiUrl}/beneficiaire/${refBsPhys}`,
    this.getHttpOptions()
  );
}


  // ✅ Créer un rapport par matricule (CIN)
  creerRapportParMatricule(
    matriculeAdherent: string,
    refBsPhys: string,
    prestataireId: string,
    rapport: RapportContreVisite
  ): Observable<any> {
    const body = {
      matriculeAdherent,
      refBsPhys,
      prestataireId,
      rapport
    };
    return this.http.post<any>(`${this.apiUrl}/create`, body, this.getHttpOptions());
  }

  // Récupérer les rapports par prestataire
  getRapportsParPrestataire(prestataireId: string): Observable<RapportContreVisite[]> {
    return this.http.get<RapportContreVisite[]>(
      `${this.apiUrl}/prestataire/${prestataireId}`, 
      this.getHttpOptions()
    );
  }

  parseLignesDentaire(lignesJson: string): LigneDentaire[] {
    try { 
      return JSON.parse(lignesJson); 
    } catch { 
      return []; 
    }
  }

  stringifyLignesDentaire(lignes: LigneDentaire[]): string {
    return JSON.stringify(lignes);
  }
}