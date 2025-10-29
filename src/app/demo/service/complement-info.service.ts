import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComplementInfoService {
    
  private apiUrl = 'http://localhost:8096/api/complement-info';
  
 

  constructor(private http: HttpClient) { }

  /**
   * Envoie les documents par email sans les stocker en base
   */
  sendComplementInfo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-email-multiple`, formData);
  }
}