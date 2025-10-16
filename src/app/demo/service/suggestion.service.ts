import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Suggestion {
  numSuggestion?: number;
  titreSuggestion: string;
  texteSuggestion: string;
  persoId: string;
  exported?: string;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  private baseUrl = 'http://localhost:8096/api/suggestions';

  constructor(private http: HttpClient) {}

  getAllSuggestions(): Observable<Suggestion[]> {
    return this.http.get<Suggestion[]>(this.baseUrl);
  }

  getSuggestionById(id: number): Observable<Suggestion> {
    return this.http.get<Suggestion>(`${this.baseUrl}/${id}`);
  }

  getSuggestionsByPersoId(persoId: string): Observable<Suggestion[]> {
    return this.http.get<Suggestion[]>(`${this.baseUrl}/user/${persoId}`);
  }

  getSuggestionsByExported(exported: string): Observable<Suggestion[]> {
    return this.http.get<Suggestion[]>(`${this.baseUrl}/exported/${exported}`);
  }

  createSuggestion(suggestion: Suggestion): Observable<Suggestion> {
    return this.http.post<Suggestion>(this.baseUrl, suggestion);
  }
}