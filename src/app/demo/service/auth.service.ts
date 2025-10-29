import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginRequest, LoginResponse, User, Admin } from '../api/login.model';
import { Prestataire } from '../api/prestataire.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8096/api/users';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentAdminSubject = new BehaviorSubject<Admin | null>(null);
  private currentPrestataireSubject = new BehaviorSubject<Prestataire | null>(null);
  private userTypeSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentAdmin$ = this.currentAdminSubject.asObservable();
  public currentPrestataire$ = this.currentPrestataireSubject.asObservable();
  public userType$ = this.userTypeSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    const storedAdmin = localStorage.getItem('currentAdmin');
    const storedPrestataire = localStorage.getItem('currentPrestataire');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      this.currentAdminSubject.next(JSON.parse(storedAdmin));
    }
    if (storedPrestataire) {
      this.currentPrestataireSubject.next(JSON.parse(storedPrestataire));
    }
    if (storedUserType) {
      this.userTypeSubject.next(storedUserType);
    }
  }

  // ========== AUTHENTIFICATION ==========

  login(request: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`, 
      request,
      { headers: headers }
    );
  }

  setUserSession(response: LoginResponse): void {
    if (response.userType === 'USER' && response.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('userType', 'USER');
      this.currentUserSubject.next(response.user);
      this.userTypeSubject.next('USER');
    } else if (response.userType === 'ADMIN' && response.admin) {
      localStorage.setItem('currentAdmin', JSON.stringify(response.admin));
      localStorage.setItem('userType', 'ADMIN');
      this.currentAdminSubject.next(response.admin);
      this.userTypeSubject.next('ADMIN');
    } else if (response.userType === 'PRESTATAIRE' && response.prestataire) {
      localStorage.setItem('currentPrestataire', JSON.stringify(response.prestataire));
      localStorage.setItem('userType', 'PRESTATAIRE');
      this.currentPrestataireSubject.next(response.prestataire);
      this.userTypeSubject.next('PRESTATAIRE');
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('currentPrestataire');
    localStorage.removeItem('userType');
    this.currentUserSubject.next(null);
    this.currentAdminSubject.next(null);
    this.currentPrestataireSubject.next(null);
    this.userTypeSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentAdmin(): Admin | null {
    return this.currentAdminSubject.value;
  }

  getCurrentPrestataire(): Prestataire | null {
    return this.currentPrestataireSubject.value;
  }

  getUserType(): string | null {
    return this.userTypeSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getUserType() !== null;
  }

  isUser(): boolean {
    return this.getUserType() === 'USER';
  }

  isAdmin(): boolean {
    return this.getUserType() === 'ADMIN';
  }

  isPrestataire(): boolean {
    return this.getUserType() === 'PRESTATAIRE';
  }

  // ========== GESTION DU RIB ==========

  getRibByPersoId(persoId: string): Observable<{ persoId: string; rib: string }> {
    return this.http.get<{ persoId: string; rib: string }>(
      `${this.baseUrl}/${persoId}/rib`
    );
  }

  updateRib(persoId: string, newRib: string): Observable<{ 
    success: boolean; 
    message: string; 
    persoId: string; 
    rib: string 
  }> {
    return this.http.put<{ 
      success: boolean; 
      message: string; 
      persoId: string; 
      rib: string 
    }>(
      `${this.baseUrl}/${persoId}/rib`,
      { rib: newRib }
    );
  }

  // ========== GESTION DU CONTACT/TÉLÉPHONE ==========

  getContactByPersoId(persoId: string): Observable<{ persoId: string; contact: string }> {
    return this.http.get<{ persoId: string; contact: string }>(
      `${this.baseUrl}/${persoId}/contact`
    );
  }

  updateContact(persoId: string, newContact: string): Observable<{ 
    success: boolean; 
    message: string; 
    persoId: string; 
    contact: string 
  }> {
    return this.http.put<{ 
      success: boolean; 
      message: string; 
      persoId: string; 
      contact: string 
    }>(
      `${this.baseUrl}/${persoId}/contact`,
      { contact: newContact }
    );
  }

  getNumContrat(codeClt: string, persoId: string): Observable<string> {
    return this.http.get<string>(
      `http://localhost:8096/api/client/numContrat?codeClt=${codeClt}&persoId=${persoId}`
    );
  }
}