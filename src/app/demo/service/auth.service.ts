import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginRequest, LoginResponse, User, Admin } from '../api/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8096/api/users';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentAdminSubject = new BehaviorSubject<Admin | null>(null);
  private userTypeSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentAdmin$ = this.currentAdminSubject.asObservable();
  public userType$ = this.userTypeSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    const storedAdmin = localStorage.getItem('currentAdmin');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      this.currentAdminSubject.next(JSON.parse(storedAdmin));
    }
    if (storedUserType) {
      this.userTypeSubject.next(storedUserType);
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    // Forcer les headers
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
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('userType');
    this.currentUserSubject.next(null);
    this.currentAdminSubject.next(null);
    this.userTypeSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentAdmin(): Admin | null {
    return this.currentAdminSubject.value;
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
}