import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    persoId: string;
    persoName: string;
    email: string;
    sexe: string;
    datNais: string;
    situationFamiliale: string;
    situationAdhesion: string;
    position: string;
    gouvNais: string;
    contact: string;
}

export interface UserStats {
    total: number;
    nouveaux: number;
}

export interface UserDetailedStats {
    repartitionParSexe: {
        [key: string]: number;
    };
    repartitionParSituationFamiliale: {
        [key: string]: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class UserStatsService {
    private apiUrl = 'http://localhost:8096/api/users';

    constructor(private http: HttpClient) {}

    /**
     * Récupère tous les utilisateurs
     */
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    // ========== NOUVELLE MÉTHODE: RÉCUPÉRER LES ENTREPRISES ==========
    
    /**
     * Récupère la liste de tous les codes d'entreprise
     */
    getAllCompanies(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/companies`);
    }

    // ========== STATISTIQUES GLOBALES (TOUTES ENTREPRISES) ==========
    
    /**
     * Statistiques globales de tous les adhérents
     */
    getGlobalStats(): Observable<UserStats> {
        return this.http.get<UserStats>(`${this.apiUrl}/stats/global`);
    }

    /**
     * Statistiques détaillées de tous les adhérents
     */
    getDetailedStats(): Observable<UserDetailedStats> {
        return this.http.get<UserDetailedStats>(`${this.apiUrl}/stats/detailed`);
    }

    /**
     * Évolution mensuelle de tous les adhérents
     */
    getEvolutionStats(): Observable<{[key: string]: number}> {
        return this.http.get<{[key: string]: number}>(`${this.apiUrl}/stats/evolution`);
    }

    // ========== STATISTIQUES PAR ENTREPRISE ==========
    
    /**
     * Statistiques globales pour une entreprise spécifique
     */
    getGlobalStatsByCompany(codeEntreprise: string): Observable<UserStats> {
        return this.http.get<UserStats>(`${this.apiUrl}/stats/global/company/${codeEntreprise}`);
    }

    /**
     * Statistiques détaillées pour une entreprise spécifique
     */
    getDetailedStatsByCompany(codeEntreprise: string): Observable<UserDetailedStats> {
        return this.http.get<UserDetailedStats>(`${this.apiUrl}/stats/detailed/company/${codeEntreprise}`);
    }

    /**
     * Évolution mensuelle pour une entreprise spécifique
     */
    getEvolutionStatsByCompany(codeEntreprise: string): Observable<{[key: string]: number}> {
        return this.http.get<{[key: string]: number}>(`${this.apiUrl}/stats/evolution/company/${codeEntreprise}`);
    }
}