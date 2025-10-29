import { Prestataire } from "./prestataire.model";

export interface LoginRequest {
    persoId: string;
    persoPassed: string;
}

export interface LoginResponse {
    message: string;
    success: boolean;
    userType: string; // Ajout du champ userType
    user: User | null;
    admin: Admin | null;
    prestataire: Prestataire | null;
}



export interface User {
    persoId: string;
    persoName: string;
    persoPassed: string;
    email: string;
    sexe: string;
    datNais: string;
    paysNais: string;
    gouvNais: string;
    cin: string;
    datePieceIdentite: string;
    situationFamiliale: string;
    adresse: string;
    contact: string;
    rib: string;
    situationAdhesion: string;
    position: string;
    token: string | null;
    remboursements: any[];
    suggestions: any[];
    reclamations: any[];
    familles: any[];
}

export interface Admin {
    persoId: string;
    persoName: string;
    persoPassed: string;
    site: string;
    type: string;
    codeEntite: string;
}