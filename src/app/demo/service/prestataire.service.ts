// prestataire.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Remboursement } from './remboursement.service';
import { Beneficiaire, CreateRapportResponse, Prestataire, RapportContreVisite } from '../api/prestataire.model';

@Injectable({
  providedIn: 'root'
})
export class PrestataireService {
  private prestataireUrl = 'http://localhost:8096/api/prestataires';
  private rapportUrl = 'http://localhost:8096/api/rapports';

  constructor(private http: HttpClient) {}

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  // ========== GESTION PRESTATAIRES ==========

  /**
   * Créer un nouveau prestataire
   */
  creerPrestataire(prestataire: Prestataire): Observable<Prestataire> {
    return this.http.post<Prestataire>(
      `${this.prestataireUrl}/create`,
      prestataire,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer tous les prestataires
   */
  getAllPrestataires(): Observable<Prestataire[]> {
    return this.http.get<Prestataire[]>(
      `${this.prestataireUrl}/all`,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer un prestataire par ID
   */
  getPrestataireById(persoId: string): Observable<Prestataire> {
    return this.http.get<Prestataire>(
      `${this.prestataireUrl}/${persoId}`,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer les prestataires par rôle
   */
  getPrestatairesByRole(role: string): Observable<Prestataire[]> {
    return this.http.get<Prestataire[]>(
      `${this.prestataireUrl}/role/${role}`,
      this.getHttpOptions()
    );
  }

  /**
   * Mettre à jour un prestataire
   */
  updatePrestataire(persoId: string, prestataire: Prestataire): Observable<Prestataire> {
    return this.http.put<Prestataire>(
      `${this.prestataireUrl}/update/${persoId}`,
      prestataire,
      this.getHttpOptions()
    );
  }

  /**
   * Supprimer un prestataire
   */
  deletePrestataire(persoId: string): Observable<string> {
    return this.http.delete<string>(
      `${this.prestataireUrl}/delete/${persoId}`,
      this.getHttpOptions()
    );
  }

  // ========== GESTION RAPPORTS CONTRE VISITE ==========

  /**
   * Créer un rapport contre visite AVEC image
   */
/**
 * Créer un rapport contre visite AVEC image
 */
creerRapport(rapport: RapportContreVisite, image?: File): Observable<CreateRapportResponse> {
  const formData = new FormData();
  
  // Ajouter le rapport en JSON string
  formData.append('rapport', JSON.stringify(rapport));
  
  // Ajouter l'image si elle existe
  if (image) {
    formData.append('image', image, image.name);
  }
  
  // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary
  return this.http.post<CreateRapportResponse>(
    `${this.rapportUrl}/create`,
    formData
    // Note: Ne pas mettre d'headers ici pour FormData
  );
}


  /**
   * Récupérer les bénéficiaires pour un remboursement
   */
  getBeneficiaires(refBsPhys: string): Observable<{ beneficiaires: Beneficiaire[] }> {
    return this.http.get<{ beneficiaires: Beneficiaire[] }>(
      `${this.rapportUrl}/beneficiaires/${refBsPhys}`,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer tous les remboursements disponibles
   */
  getAllRemboursements(): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(
      `${this.rapportUrl}/remboursements`,
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer les rapports d'un prestataire
   */
  getRapportsParPrestataire(prestataireId: string): Observable<RapportContreVisite[]> {
    return this.http.get<RapportContreVisite[]>(
      `${this.rapportUrl}/prestataire/${prestataireId}`,
      this.getHttpOptions()
    );
  }

  // ========== MÉTHODES UTILITAIRES ==========

  /**
   * Parser les lignes dentaires depuis JSON
   */
  parseLignesDentaire(lignesJson: string): any[] {
    try {
      return JSON.parse(lignesJson);
    } catch {
      return [];
    }
  }

  /**
   * Convertir les lignes dentaires en JSON
   */
  stringifyLignesDentaire(lignes: any[]): string {
    return JSON.stringify(lignes);
  }

  /**
   * Formater un montant en devise
   */
  formatCurrency(montant: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant);
  }
}