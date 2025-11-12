

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reclamation, CreateReclamationRequest } from '../api/reclamation.model';
import { Remboursement } from './remboursement.service';

export interface ReclamationCount {
  count: number;
  maxAllowed: number;
  canCreate: boolean;
  remaining: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8096/api/reclamations';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Créer une nouvelle réclamation
  createReclamation(reclamation: CreateReclamationRequest): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, reclamation, {
      headers: this.getHeaders()
    });
  }

  // ✅ NOUVELLE MÉTHODE : Récupérer le nombre de réclamations pour un remboursement
  getReclamationCount(refBsPhys: string): Observable<ReclamationCount> {
    return this.http.get<ReclamationCount>(`${this.apiUrl}/count/${refBsPhys}`);
  }

  // Récupérer toutes les réclamations d'un utilisateur
  getReclamationsByUser(persoId: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/user/${persoId}`);
  }

  // Récupérer une réclamation par son ID
  getReclamationById(numReclamation: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${numReclamation}`);
  }

  // Récupérer les réclamations par référence de remboursement
  getReclamationsByRefBsPhys(refBsPhys: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/remboursement/${refBsPhys}`);
  }

  // Vérifier si une réclamation existe pour un remboursement
  hasReclamation(refBsPhys: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/exists/${refBsPhys}`);
  }

  // Récupérer tous les remboursements d'un utilisateur
  getRemboursementsByUser(persoId: string): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(`${this.apiUrl}/remboursements/${persoId}`);
  }

  // Supprimer une réclamation
  deleteReclamation(numReclamation: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numReclamation}`);
  }

  // Mettre à jour la réponse d'une réclamation
  updateReclamationResponse(numReclamation: number, response: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(
      `${this.apiUrl}/${numReclamation}/response`,
      { response },
      { headers: this.getHeaders() }
    );
  }
}