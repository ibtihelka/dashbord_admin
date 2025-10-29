import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RapportContreVisite {
  id?: number;
  prestataireId: string;
  beneficiaireId: string;
  beneficiaireNom: string;
  typeBeneficiaire: string;
  refBsPhys: string;
  typeRapport: string;
  observation: string;
  dateRapport?: Date;
  
  // Champs DENTISTE
  lignesDentaire?: string; // JSON string
  
  // Champs OPTICIEN
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

  /**
   * Créer un nouveau rapport contre visite
   */
  creerRapport(rapport: RapportContreVisite): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/create`,
      rapport,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer les bénéficiaires d'un remboursement
   */
  getBeneficiaires(refBsPhys: string): Observable<{ beneficiaires: Beneficiaire[] }> {
    return this.http.get<{ beneficiaires: Beneficiaire[] }>(
      `${this.apiUrl}/beneficiaires/${refBsPhys}`,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer tous les remboursements disponibles
   */
  getAllRemboursements(): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(
      `${this.apiUrl}/remboursements`,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer les rapports d'un prestataire
   */
  getRapportsParPrestataire(prestataireId: string): Observable<RapportContreVisite[]> {
    return this.http.get<RapportContreVisite[]>(
      `${this.apiUrl}/prestataire/${prestataireId}`,
      this.getHttpOptions()
    );
  }

  /**
   * Parser les lignes dentaires (JSON string -> objets)
   */
  parseLignesDentaire(lignesJson: string): LigneDentaire[] {
    try {
      return JSON.parse(lignesJson);
    } catch (e) {
      return [];
    }
  }

  /**
   * Stringifier les lignes dentaires (objets -> JSON string)
   */
  stringifyLignesDentaire(lignes: LigneDentaire[]): string {
    return JSON.stringify(lignes);
  }
}