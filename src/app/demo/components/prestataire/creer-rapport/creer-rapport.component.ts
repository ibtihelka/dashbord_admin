// creer-rapport.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Beneficiaire, Prestataire, RapportContreVisite } from 'src/app/demo/api/prestataire.model';

import { AuthService } from 'src/app/demo/service/auth.service';
import { PrestataireService } from 'src/app/demo/service/prestataire.service';

import { Remboursement } from 'src/app/demo/service/remboursement.service';

interface LigneDentaire {
  dent: string;
  codeActe: string;
  cotation: string;
  avisMedical: string;
}

@Component({
  selector: 'app-creer-rapport',
  templateUrl: './creer-rapport.component.html',
  styleUrls: ['./creer-rapport.component.scss'],
  providers: [MessageService]
})
export class CreerRapportComponent implements OnInit {
  prestataire: Prestataire | null = null;
  rapportForm!: FormGroup;
  
  remboursements: Remboursement[] = [];
  beneficiaires: Beneficiaire[] = [];
  selectedRemboursement: Remboursement | null = null;
  
  loading = false;
  isDentiste = false;
  isOpticien = false;

  // Nouveau: pour affichage du rapport créé
  displayRapportDialog = false;
  rapportCree: RapportContreVisite | null = null;
  lignesDentaireCree: LigneDentaire[] = [];

  constructor(
    private fb: FormBuilder,
    private prestataireService: PrestataireService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.prestataire = this.authService.getCurrentPrestataire();
    
    if (!this.prestataire) {
      return;
    }

    this.isDentiste = this.prestataire.role === 'DENTISTE';
    this.isOpticien = this.prestataire.role === 'OPTICIEN';

    this.initForm();
    this.loadRemboursements();
  }

  initForm(): void {
    this.rapportForm = this.fb.group({
      refBsPhys: ['', Validators.required],
      beneficiaireId: ['', Validators.required],
      beneficiaireNom: ['', Validators.required],
      observation: ['', Validators.required],
      
      // Champs DENTISTE
      lignesDentaire: this.fb.array([]),
      
      // Champs OPTICIEN
      acuiteVisuelleOD: [''],
      acuiteVisuelleOG: [''],
      prixMonture: [null],
      natureVerres: [''],
      prixVerres: [null]
    });

    if (this.isDentiste) {
      this.addLigneDentaire();
    }
  }

  get lignesDentaire(): FormArray {
    return this.rapportForm.get('lignesDentaire') as FormArray;
  }

  addLigneDentaire(): void {
    if (this.lignesDentaire.length >= 10) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Maximum 10 lignes autorisées'
      });
      return;
    }

    const ligne = this.fb.group({
      dent: ['', Validators.required],
      codeActe: ['', Validators.required],
      cotation: ['', Validators.required],
      avisMedical: ['', Validators.required]
    });

    this.lignesDentaire.push(ligne);
  }

  removeLigneDentaire(index: number): void {
    this.lignesDentaire.removeAt(index);
  }

  loadRemboursements(): void {
    this.loading = true;
    this.prestataireService.getAllRemboursements().subscribe({
      next: (data) => {
        this.remboursements = data;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les remboursements'
        });
        this.loading = false;
      }
    });
  }

  onRemboursementChange(event: any): void {
    const refBsPhys = event.value;
    this.selectedRemboursement = this.remboursements.find(r => r.refBsPhys === refBsPhys) || null;
    
    if (refBsPhys) {
      this.loadBeneficiaires(refBsPhys);
    } else {
      this.beneficiaires = [];
      this.rapportForm.patchValue({
        beneficiaireId: '',
        beneficiaireNom: ''
      });
    }
  }

  loadBeneficiaires(refBsPhys: string): void {
    this.prestataireService.getBeneficiaires(refBsPhys).subscribe({
      next: (response) => {
        this.beneficiaires = response.beneficiaires;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les bénéficiaires'
        });
      }
    });
  }

  onBeneficiaireChange(event: any): void {
    const beneficiaire = this.beneficiaires.find(b => b.id === event.value);
    if (beneficiaire) {
      this.rapportForm.patchValue({
        beneficiaireNom: beneficiaire.nom
      });
    }
  }

onSubmit(): void {
  if (this.rapportForm.invalid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  const rapport: RapportContreVisite = {
    prestataireId: this.prestataire!.persoId,
    beneficiaireId: this.rapportForm.value.beneficiaireId,
    beneficiaireNom: this.rapportForm.value.beneficiaireNom,
    refBsPhys: this.rapportForm.value.refBsPhys,
    typeRapport: this.prestataire!.role,
    observation: this.rapportForm.value.observation
  };

  if (this.isDentiste) {
    rapport.lignesDentaire = JSON.stringify(this.rapportForm.value.lignesDentaire);
  } else if (this.isOpticien) {
    rapport.acuiteVisuelleOD = this.rapportForm.value.acuiteVisuelleOD;
    rapport.acuiteVisuelleOG = this.rapportForm.value.acuiteVisuelleOG;
    rapport.prixMonture = this.rapportForm.value.prixMonture;
    rapport.natureVerres = this.rapportForm.value.natureVerres;
    rapport.prixVerres = this.rapportForm.value.prixVerres;
  }

  this.loading = true;
  
  // CORRECTION : Vérification plus stricte
  let imageToSend: File | undefined;
  if (this.selectedImage instanceof File) {
    imageToSend = this.selectedImage;
  }
  
  this.prestataireService.creerRapport(rapport, imageToSend).subscribe({
    next: (response) => {
      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: response.message
        });
        
        this.rapportCree = {
          ...rapport,
          dateCreation: new Date()
        };
        
        if (this.isDentiste && rapport.lignesDentaire) {
          this.lignesDentaireCree = JSON.parse(rapport.lignesDentaire);
        }
        
        this.displayRapportDialog = true;
        this.resetForm();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message
        });
      }
      this.loading = false;
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.error?.message || 'Une erreur est survenue'
      });
      this.loading = false;
    }
  });
}

 resetForm(): void {
  this.rapportForm.reset();
  this.beneficiaires = [];
  this.selectedRemboursement = null;
  this.selectedImage = null; // CORRECTION : Réinitialiser l'image
  this.imagePreview = null;  // CORRECTION : Réinitialiser l'aperçu
  
  if (this.isDentiste) {
    this.lignesDentaire.clear();
    this.addLigneDentaire();
  }
}
  closeRapportDialog(): void {
    this.displayRapportDialog = false;
    this.rapportCree = null;
    this.lignesDentaireCree = [];
  }

  imprimerRapport(): void {
    window.print();
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }




  // === Propriétés manquantes ===
  maxFileSize: number = 5 * 1024 * 1024; // 5 Mo (tu peux changer la taille maximale)
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  // === Méthodes manquantes ===

  /**
   * Gère la sélection d'image
   * @param event - événement déclenché lors de la sélection d'un fichier
   */
 onImageSelect(event: any): void {
  const file = event.files ? event.files[0] : event.target.files[0];
  if (file) {
    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        this.imagePreview = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}


  /**
   * Supprime l'image sélectionnée
   */
  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }
}