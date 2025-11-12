import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginRequest, LoginResponse, User, Admin } from '../api/login.model';
import { Prestataire } from '../api/prestataire.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ CORRECTION: Utiliser le bon endpoint
  private baseUrl = 'http://localhost:8096/api/auth';
  private baseUrl1 = 'http://localhost:8096/api';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentAdminSubject = new BehaviorSubject<Admin | null>(null);
  private currentPrestataireSubject = new BehaviorSubject<Prestataire | null>(null);
  private currentSocieteSubject = new BehaviorSubject<any | null>(null);
  private userTypeSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentAdmin$ = this.currentAdminSubject.asObservable();
  public currentPrestataire$ = this.currentPrestataireSubject.asObservable();
  public currentSociete$ = this.currentSocieteSubject.asObservable();
  public userType$ = this.userTypeSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = sessionStorage.getItem('currentUser');
    const storedAdmin = sessionStorage.getItem('currentAdmin');
    const storedPrestataire = sessionStorage.getItem('currentPrestataire');
    const storedSociete = sessionStorage.getItem('currentSociete');
    const storedUserType = sessionStorage.getItem('userType');
    
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      this.currentAdminSubject.next(JSON.parse(storedAdmin));
    }
    if (storedPrestataire) {
      this.currentPrestataireSubject.next(JSON.parse(storedPrestataire));
    }
    if (storedSociete) {
      this.currentSocieteSubject.next(JSON.parse(storedSociete));
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

    // ✅ CORRECTION: Utiliser le bon endpoint
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`, 
      request,
      { headers: headers }
    );
  }

 setUserSession(response: LoginResponse): void {
  console.log('🔵 setUserSession appelé avec:', response);
  
  // ✅ Utiliser 'role' en priorité, sinon 'userType'
  const userType = response.role || response.userType;
  console.log('🔵 Type détecté:', userType);
  
  if (userType === 'USER' && response.user) {
    console.log('✅ Sauvegarde USER');
    sessionStorage.setItem('currentUser', JSON.stringify(response.user));
    sessionStorage.setItem('userType', 'USER');
    this.currentUserSubject.next(response.user);
    this.userTypeSubject.next('USER');
  } 
  else if (userType === 'ADMIN' && response.admin) {
    console.log('✅ Sauvegarde ADMIN');
    sessionStorage.setItem('currentAdmin', JSON.stringify(response.admin));
    sessionStorage.setItem('userType', 'ADMIN');
    this.currentAdminSubject.next(response.admin);
    this.userTypeSubject.next('ADMIN');
  } 
  else if (userType === 'PRESTATAIRE' && response.prestataire) {
    console.log('✅ Sauvegarde PRESTATAIRE');
    sessionStorage.setItem('currentPrestataire', JSON.stringify(response.prestataire));
    sessionStorage.setItem('userType', 'PRESTATAIRE');
    this.currentPrestataireSubject.next(response.prestataire);
    this.userTypeSubject.next('PRESTATAIRE');
  }
  else if (userType === 'SOCIETE' && response.usersSociete) {
    console.log('✅ Sauvegarde SOCIETE');
    sessionStorage.setItem('currentSociete', JSON.stringify(response.usersSociete));
    sessionStorage.setItem('userType', 'SOCIETE');
    this.currentSocieteSubject.next(response.usersSociete);
    this.userTypeSubject.next('SOCIETE');
  }
  else {
    console.error('❌ Type utilisateur non reconnu ou données manquantes:', {
      userType,
      hasUser: !!response.user,
      hasAdmin: !!response.admin,
      hasPrestataire: !!response.prestataire,
      hasUsersSociete: !!response.usersSociete
    });
  }
  
  // ✅ Vérification finale
  console.log('🔍 Session Storage après sauvegarde:', {
    userType: sessionStorage.getItem('userType'),
    currentUser: sessionStorage.getItem('currentUser'),
    currentAdmin: sessionStorage.getItem('currentAdmin'),
    currentPrestataire: sessionStorage.getItem('currentPrestataire'),
    currentSociete: sessionStorage.getItem('currentSociete')
  });
}

  logout(): void {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentAdmin');
    sessionStorage.removeItem('currentPrestataire');
    sessionStorage.removeItem('currentSociete');
    sessionStorage.removeItem('userType');
    this.currentUserSubject.next(null);
    this.currentAdminSubject.next(null);
    this.currentPrestataireSubject.next(null);
    this.currentSocieteSubject.next(null);
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

  getCurrentSociete(): any | null {
    return this.currentSocieteSubject.value;
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

  isSociete(): boolean {
    return this.getUserType() === 'SOCIETE';
  }

  // ========== GESTION DU RIB ==========

  getRibByPersoId(persoId: string): Observable<{ persoId: string; rib: string }> {
    return this.http.get<{ persoId: string; rib: string }>(
      `${this.baseUrl1}/users/${persoId}/rib`
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
      `${this.baseUrl1}/users/${persoId}/rib`,
      { rib: newRib }
    );
  }

  // ========== GESTION DU CONTACT/TÉLÉPHONE ==========

  getContactByPersoId(persoId: string): Observable<{ persoId: string; contact: string }> {
    return this.http.get<{ persoId: string; contact: string }>(
      `${this.baseUrl1}/users/${persoId}/contact`
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
      `${this.baseUrl1}/users/${persoId}/contact`,
      { contact: newContact }
    );
  }

  getNumContrat(codeClt: string, persoId: string): Observable<string> {
    return this.http.get(`${this.baseUrl1}/client/numContrat`, {
      params: { codeClt, persoId },
      responseType: 'text'
    });
  }
}