import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/demo/api/login.model';
import { AuthService } from 'src/app/demo/service/auth.service';
import { RemboursementService, Remboursement } from 'src/app/demo/service/remboursement.service';
import { Subscription } from 'rxjs';
import { PrestataireListComponent } from '../prestataire-list/prestataire-list.component';

interface BulletinOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit, OnDestroy {

  @ViewChild(PrestataireListComponent) prestataireList!: PrestataireListComponent;

  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();

   beneficiaireSelected: string = '';
    dateSoinSelected: string = '';


  
  bulletinOptions: BulletinOption[] = [];
  selectedBulletin: string = '';
  remboursements: Remboursement[] = [];

  isTeleperformanceUser: boolean = false;
  companyName: string = '';

  // État des checkboxes
  selectedType: 'PRESTATAIRE' | 'CONJOINT' | 'ENFANT' | 'ADHERENT' | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private remboursementService: RemboursementService
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        if (user) {
          this.checkCompany();
          this.loadBulletins();
          this.loadNumContrat();
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkCompany(): void {
    if (this.currentUser && this.currentUser.persoId) {
      const persoIdPrefix = this.currentUser.persoId.substring(0, 8);
      this.isTeleperformanceUser = persoIdPrefix === 'SO000008';
      
      if (this.isTeleperformanceUser) {
        this.companyName = 'Teleperformance';
      } else {
        this.companyName = 'Non défini';
      }
    }
  }

  getCompanyName(): string {
    return this.companyName || 'Non défini';
  }

  loadBulletins(): void {
    if (!this.currentUser || !this.currentUser.persoId) {
      return;
    }

    this.remboursementService.getRemboursementsByPersoId(this.currentUser.persoId)
      .subscribe({
        next: (data) => {
          this.remboursements = data;
          this.populateBulletinOptions();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des bulletins:', error);
        }
      });
  }

  populateBulletinOptions(): void {
    console.log('🚀 populateBulletinOptions appelée');
    console.log('📊 Nombre de remboursements:', this.remboursements.length);
    
    this.bulletinOptions = this.remboursements.map(remb => ({
      label: `${remb.refBsPhys} `,
      value: remb.refBsPhys
    }));

    console.log('📋 Options de bulletin créées:', this.bulletinOptions);

    if (this.bulletinOptions.length > 0) {
      this.selectedBulletin = this.bulletinOptions[0].value;
      console.log('✅ Bulletin par défaut sélectionné:', this.selectedBulletin);
      
      // ✅ Sélectionner automatiquement le type au chargement initial
      setTimeout(() => {
        console.log('⏰ Appel de updateSelectedTypeFromBulletin après timeout');
        this.updateSelectedTypeFromBulletin(this.selectedBulletin);
      }, 100);
    } else {
      console.log('⚠️ Aucune option de bulletin disponible');
    }
  }

  /**
   * ✅ NOUVELLE MÉTHODE : Déterminer et sélectionner le type de prestataire
   * en fonction du remboursement sélectionné
   */
  updateSelectedTypeFromBulletin(refBsPhys: string): void {
    // Trouver le remboursement correspondant
    const remboursement = this.remboursements.find(r => r.refBsPhys === refBsPhys);
    
    if (!remboursement) {
      console.log('❌ Remboursement non trouvé pour:', refBsPhys);
      this.selectedType = null;
      return;
    }

    console.log('═══════════════════════════════════════════');
    console.log('🔍 ANALYSE DU REMBOURSEMENT', refBsPhys);
    console.log('═══════════════════════════════════════════');
    console.log('📋 Objet remboursement complet:', remboursement);
    console.log('👤 nomPrenPrest:', remboursement.nomPrenPrest);
    console.log('🆔 persoId du BS:', remboursement.persoId);
    
    // Récupérer le nom du prestataire du remboursement
    const nomPrenPrest = remboursement.nomPrenPrest?.toUpperCase().trim() || '';
    const persoIdBS = remboursement.persoId;

    console.log('👤 Nom prestataire (normalisé):', nomPrenPrest);
    console.log('👤 Adhérent actuel:', this.currentUser?.persoName);
    console.log('🆔 PersoId adhérent:', this.currentUser?.persoId);

    // ⚠️ MÉTHODE 1 : Correspondance par persoId (plus fiable)
    if (persoIdBS) {
      console.log('\n🔎 Méthode 1: Recherche par persoId');
      
      // Vérifier si c'est l'adhérent
      if (persoIdBS === this.currentUser?.persoId) {
        console.log('✅ PersoId correspond à l\'adhérent');
        this.selectedType = 'ADHERENT';
        return;
      }

      // Chercher dans les familles par persoId
      if (this.currentUser?.familles && this.currentUser.familles.length > 0) {
        for (const membreFamille of this.currentUser.familles) {
          console.log(`  Vérif: ${membreFamille.persoId} === ${persoIdBS}`);
          
          if (membreFamille.persoId === persoIdBS) {
            const typePrest = membreFamille.typPrestataire?.toUpperCase();
            console.log(`✅ PersoId trouvé dans famille: ${membreFamille.prenomPrestataire} (${typePrest})`);
            
            if (typePrest === 'CONJOINT') {
              this.selectedType = 'CONJOINT';
              if (this.prestataireList) {
                this.prestataireList.showConjoint();
              }
              return;
            } else if (typePrest === 'ENFANT') {
              this.selectedType = 'ENFANT';
              if (this.prestataireList) {
                this.prestataireList.showEnfants();
              }
              return;
            }
          }
        }
      }
    }

    //  MÉTHODE 2 : Correspondance par nom (fallback)
    console.log('\n Méthode 2: Recherche par nom');
    
    if (this.currentUser?.familles && this.currentUser.familles.length > 0) {
      console.log(' Liste des familles:');
      
      for (const membreFamille of this.currentUser.familles) {
        const prenomFamille = membreFamille.prenomPrestataire?.toUpperCase().trim() || '';
        const typePrest = membreFamille.typPrestataire?.toUpperCase();
        
        console.log(`  - ${prenomFamille} (${typePrest}) [persoId: ${membreFamille.persoId}]`);
        
        // Vérifier plusieurs types de correspondance
        const correspondance = 
          prenomFamille && (
            nomPrenPrest.includes(prenomFamille) ||
            prenomFamille.includes(nomPrenPrest) ||
            nomPrenPrest === prenomFamille
          );
        
        if (correspondance) {
          console.log(` Correspondance nom trouvée: "${prenomFamille}" ↔ "${nomPrenPrest}" → ${typePrest}`);
          
          if (typePrest === 'CONJOINT') {
            this.selectedType = 'CONJOINT';
            if (this.prestataireList) {
              this.prestataireList.showConjoint();
            }
            return;
          } else if (typePrest === 'ENFANT') {
            this.selectedType = 'ENFANT';
            if (this.prestataireList) {
              this.prestataireList.showEnfants();
            }
            return;
          }
        }
      }
    }

    //  MÉTHODE 3 : Vérifier si c'est l'adhérent par nom
    console.log('\n Méthode 3: Vérification adhérent par nom');
    const userDisplayName = this.getUserDisplayName().toUpperCase().trim();
    const persoName = this.currentUser?.persoName?.toUpperCase().trim() || '';
    
    console.log(`  Comparaison: "${nomPrenPrest}" vs "${userDisplayName}" ou "${persoName}"`);
    
    if (nomPrenPrest === userDisplayName || 
        nomPrenPrest === persoName ||
        (persoName && nomPrenPrest.includes(persoName))) {
      console.log(' C\'est l\'adhérent (par nom)');
      this.selectedType = 'ADHERENT';
      return;
    }

    // Si aucune correspondance trouvée
    console.log('\nAUCUNE CORRESPONDANCE TROUVÉE');
    console.log('═══════════════════════════════════════════\n');
    this.selectedType = null;
  }

  /**
   *  Gestion du changement de bulletin
   */
  onBulletinChange(event: any): void {
  this.updateSelectedTypeFromBulletin(event.value);

  const remboursement = this.remboursements.find(r => r.refBsPhys === event.value);
  if (remboursement) {
    this.beneficiaireSelected = remboursement.nomPrenPrest;
    this.dateSoinSelected = this.formatDate(remboursement.datBs);
  } else {
    this.beneficiaireSelected = '';
    this.dateSoinSelected = '';
  }
}


  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  goToRemboursements(): void {
    this.router.navigate(['/clients/mesRemboursements']);
  }

  goToReclamations(): void {
    this.router.navigate(['/clients/reclamations']);
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return this.currentUser.persoName 
      ? `${this.currentUser.persoName}` 
      : this.currentUser.persoName || this.currentUser.persoId || 'Utilisateur';
  }

  /**
   * Gère le clic sur "Prestataire" - affiche tous les conjoints et enfants
   */
  onPrestataireClick(): void {
    if (this.selectedType === 'PRESTATAIRE') {
      this.selectedType = null;
      return;
    }

    if (this.hasPrestataires()) {
      this.selectedType = 'PRESTATAIRE';
      if (this.prestataireList) {
        this.prestataireList.showAllPrestataires();
      }
    }
  }

  /**
   * Gère le clic sur "Conjoint" - affiche uniquement le conjoint
   */
  onConjointClick(): void {
    if (this.selectedType === 'CONJOINT') {
      this.selectedType = null;
      return;
    }

    if (this.hasConjoint()) {
      this.selectedType = 'CONJOINT';
      if (this.prestataireList) {
        this.prestataireList.showConjoint();
      }
    }
  }

  /**
   * Gère le clic sur "Enfant" - affiche uniquement les enfants
   */
  onEnfantClick(): void {
    if (this.selectedType === 'ENFANT') {
      this.selectedType = null;
      return;
    }

    if (this.hasEnfants()) {
      this.selectedType = 'ENFANT';
      if (this.prestataireList) {
        this.prestataireList.showEnfants();
      }
    }
  }

  /**
   * Gère le clic sur "Adhérent" - redirige vers le profil
   */
  onAdherentClick(): void {
    this.router.navigate(['/clients/profile']);
  }

  /**
   * Vérifie si des prestataires existent (conjoint ou enfants)
   */
  hasPrestataires(): boolean {
    if (!this.currentUser?.familles) return false;
    return this.currentUser.familles.some(
      membre => {
        const type = membre.typPrestataire?.toUpperCase();
        return type === 'CONJOINT' || type === 'ENFANT';
      }
    );
  }

  /**
   * Vérifie si le conjoint existe
   */
  hasConjoint(): boolean {
    if (!this.currentUser?.familles) return false;
    return this.currentUser.familles.some(
      membre => membre.typPrestataire?.toUpperCase() === 'CONJOINT'
    );
  }

  /**
   * Vérifie si des enfants existent
   */
  hasEnfants(): boolean {
    if (!this.currentUser?.familles) return false;
    return this.currentUser.familles.some(
      membre => membre.typPrestataire?.toUpperCase() === 'ENFANT'
    );
  }

  numContrat: string = '';

  loadNumContrat(): void {
    if (!this.currentUser) return;
    const codeClt = this.currentUser.persoId;
    this.authService.getNumContrat(codeClt, this.currentUser.persoId)
      .subscribe({
        next: (res) => {
          this.numContrat = res;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du numéro de contrat', err);
        }
      });
  }

  getUserAddress(): string {
    if (!this.currentUser) return '';
    return this.currentUser.adresse || '';
  }

  goToTel(): void {
    this.router.navigate(['/clients/tel']);
  }

  goToRib(): void {
    this.router.navigate(['/clients/rib']);
  }

  goToComplementInfo(): void {
  this.router.navigate(['/clients/complement-information']);
}



updateBeneficiaireEtDate(refBsPhys: string): void {
  const remboursement = this.remboursements.find(r => r.refBsPhys === refBsPhys);

  if (remboursement) {
    // Nom du bénéficiaire (à afficher en haut)
    this.beneficiaireSelected = remboursement.nomPrenPrest;

    // Date du soin (formatée pour le champ "Le")
    this.dateSoinSelected = this.formatDate(remboursement.datBs);
  } else {
    this.beneficiaireSelected = '';
    this.dateSoinSelected = '';
  }
}


}