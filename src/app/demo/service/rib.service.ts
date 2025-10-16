import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rib {
  numRib?: number;
  rib: string;
  persoId: string;
  exported?: string;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RibService {
  private baseUrl = 'http://localhost:8096/api/rib';

  constructor(private http: HttpClient) {}

  getAllRibs(): Observable<Rib[]> {
    return this.http.get<Rib[]>(this.baseUrl);
  }

  getRibById(id: number): Observable<Rib> {
    return this.http.get<Rib>(`${this.baseUrl}/${id}`);
  }

  getRibsByPersoId(persoId: string): Observable<Rib[]> {
    return this.http.get<Rib[]>(`${this.baseUrl}/user/${persoId}`);
  }

  getRibsByExported(exported: string): Observable<Rib[]> {
    return this.http.get<Rib[]>(`${this.baseUrl}/exported/${exported}`);
  }

  createRib(rib: Rib): Observable<Rib> {
    return this.http.post<Rib>(this.baseUrl, rib);
  }
}