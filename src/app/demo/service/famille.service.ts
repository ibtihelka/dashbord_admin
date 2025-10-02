// famille.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Famille {
  prenomPrestataire: string;
  typPrestataire: string;
  persoId: string;
  datNais: Date;
  sexe: string;
  user?: any;
}

export interface FamilleStats {
  totalFamilles: number;
  repartitionParType: { [key: string]: number };
  repartitionParSexe: { [key: string]: number };
  moyenneAge: number;
  repartitionParTrancheAge: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class FamilleService {
  private apiUrl = 'http://localhost:8096/api/familles';

  // Configuration de l'authentification Basic Auth
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('admin:admin123') // Encode en Base64
    })
  };

  constructor(private http: HttpClient) {}

  // Dans famille.service.ts
getAllFamillesWithStats(): Observable<{familles: Famille[], totalCount: number}> {
  return this.http.get<any>(`${this.apiUrl}/with-pagination?size=10000`, this.httpOptions)
    .pipe(
      map(response => ({
        familles: response.content,
        totalCount: response.totalElements
      }))
    );
}

// Ou utiliser le count séparément
getTotalCount(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/count`, this.httpOptions);
}


  getAllFamilles(): Observable<Famille[]> {
    return this.http.get<Famille[]>(this.apiUrl, this.httpOptions);
  }

  getFamilleById(id: string): Observable<Famille> {
    return this.http.get<Famille>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  getFamillesByPersoId(persoId: string): Observable<Famille[]> {
    return this.http.get<Famille[]>(`${this.apiUrl}/user/${persoId}`, this.httpOptions);
  }

  getFamillesByType(type: string): Observable<Famille[]> {
    return this.http.get<Famille[]>(`${this.apiUrl}/type/${type}`, this.httpOptions);
  }

  // Méthode pour calculer les statistiques
  calculateStats(familles: Famille[]): FamilleStats {
    
    const totalFamilles = familles.length;
    
    // Répartition par type
    const repartitionParType: { [key: string]: number } = {};
    familles.forEach(f => {
      const type = f.typPrestataire || 'Non défini';
      repartitionParType[type] = (repartitionParType[type] || 0) + 1;
    });

    // Répartition par sexe
    const repartitionParSexe: { [key: string]: number } = {};
    familles.forEach(f => {
      const sexe = f.sexe || 'Non défini';
      repartitionParSexe[sexe] = (repartitionParSexe[sexe] || 0) + 1;
    });

    // Calcul de l'âge moyen
    const aujourdhui = new Date();
    const ages = familles
      .filter(f => f.datNais)
      .map(f => {
        const naissance = new Date(f.datNais);
        return aujourdhui.getFullYear() - naissance.getFullYear();
      });
    
    const moyenneAge = ages.length > 0 ? 
      Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;

    // Répartition par tranche d'âge
    const repartitionParTrancheAge: { [key: string]: number } = {
      '0-17': 0,
      '18-35': 0,
      '36-50': 0,
      '51-65': 0,
      '66+': 0
    };

    ages.forEach(age => {
      if (age <= 17) repartitionParTrancheAge['0-17']++;
      else if (age <= 35) repartitionParTrancheAge['18-35']++;
      else if (age <= 50) repartitionParTrancheAge['36-50']++;
      else if (age <= 65) repartitionParTrancheAge['51-65']++;
      else repartitionParTrancheAge['66+']++;
    });

    return {
      totalFamilles,
      repartitionParType,
      repartitionParSexe,
      moyenneAge,
      repartitionParTrancheAge
    };
  }
}