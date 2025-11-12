import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BordereauDashboard } from '../api/bordereau-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class BordereauDashboardService {

  private apiUrl = 'http://localhost:8096/api/bordereaux/dashboard';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Récupérer le dashboard d'une société par préfixe
  getDashboardData(societePrefix: string): Observable<BordereauDashboard[]> {
    return this.http.get<BordereauDashboard[]>(`${this.apiUrl}/${societePrefix}`, this.httpOptions);
  }
}
