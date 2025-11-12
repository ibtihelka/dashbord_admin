import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BordereauStats } from '../api/bordereau-stats.model';

@Injectable({
  providedIn: 'root'
})
export class BordereauStatsService {

  private apiUrl = 'http://localhost:8096/api/bordereaux';

  constructor(private http: HttpClient) {}

  // Récupérer les stats d'un bordereau spécifique
  getBordereauStats(refBordereau: string): Observable<BordereauStats> {
    return this.http.get<BordereauStats>(`${this.apiUrl}/dashboard/${refBordereau}`);
  }

  // Récupérer tous les bordereaux pour la société
  getBordereauxByPrefix(prefix: string): Observable<{ refBordereau: string }[]> {
    return this.http.get<{ refBordereau: string }[]>(`${this.apiUrl}/by-prefix?prefix=${prefix}`);
  }
}
