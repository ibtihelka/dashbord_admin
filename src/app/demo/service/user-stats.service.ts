// src/app/service/user-stats.service.ts
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
        [key: string]: number; // 'M', 'F', etc.
    };
    repartitionParSituationFamiliale: {
        [key: string]: number; // 'CELIBATAIRE', 'MARIE', etc.
    };
}
@Injectable({
    providedIn: 'root'
})
export class UserStatsService {
    private apiUrl = 'http://localhost:8096/api/users';

    constructor(private http: HttpClient) {}

   

    /**
     * Récupère tous les utilisateurs avec leurs détails
     */
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

  

  

    private calculateAge(birthDate: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;


    }
    
    /**
     * Obtenir les statistiques globales (total et nouveaux)
     */
    getGlobalStats(): Observable<UserStats> {
        return this.http.get<UserStats>(`${this.apiUrl}/stats/global`);
    }

    /**
     * Obtenir les statistiques détaillées
     */
    getDetailedStats(): Observable<UserDetailedStats> {
        return this.http.get<UserDetailedStats>(`${this.apiUrl}/stats/detailed`);
    }


    getEvolutionStats(): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/stats/evolution`);
}
}