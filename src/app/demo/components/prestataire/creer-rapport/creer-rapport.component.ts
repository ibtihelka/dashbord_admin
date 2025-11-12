import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RapportContreVisiteService, RapportContreVisite, LigneDentaire, Beneficiaire, Remboursement, Adherent } from 'src/app/demo/service/rapport-contre-visite.service';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-creer-rapport',
  templateUrl: './creer-rapport.component.html',
  styleUrls: ['./creer-rapport.component.scss'],
  providers: [MessageService]
})
export class CreerRapportComponent implements OnInit {
  prestataire: any;
  rapportForm!: FormGroup;
  adherents: Adherent[] = [];
  remboursements: Remboursement[] = [];
  beneficiaires: Beneficiaire[] = [];
  selectedAdherent: Adherent | null = null;
  selectedRemboursement: Remboursement | null = null;
  selectedBeneficiaire: Beneficiaire | null = null;
  isDentiste = false;
  isOpticien = false;
  loading = false;

  // Rapport créé
  displayRapportDialog = false;
  rapportCree: RapportContreVisite | null = null;
  lignesDentaireCree: LigneDentaire[] = [];

  // Image
  maxFileSize = 5 * 1024 * 1024;
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private rapportService: RapportContreVisiteService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.prestataire = this.authService.getCurrentPrestataire();
    if (!this.prestataire) return;

    this.isDentiste = this.prestataire.role === 'DENTISTE';
    this.isOpticien = this.prestataire.role === 'OPTICIEN';
    this.initForm();
    this.loadAdherents(); // Charger les adhérents au démarrage
  }

  initForm(): void {
    this.rapportForm = this.fb.group({
      matriculeAdherent: ['', Validators.required],
      refBsPhys: ['', Validators.required],
      beneficiaireNom: [''],
      observation: ['', Validators.required],
      lignesDentaire: this.fb.array([]),
      acuiteVisuelleOD: [''],
      acuiteVisuelleOG: [''],
      prixMonture: [null],
      natureVerres: [''],
      prixVerres: [null]
    });
    if (this.isDentiste) this.addLigneDentaire();
  }

  // Charger tous les adhérents (avec virtualScroll le dropdown gérera l'affichage)
  loadAdherents(): void {
    this.rapportService.getAllAdherents().subscribe({
      next: (data) => {
        this.adherents = data;
        console.log('✅ Adhérents chargés:', this.adherents.length, 'adhérents');
      },
      error: (err) => {
        console.error('❌ Erreur chargement adhérents:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Impossible de charger les adhérents' 
        });
      }
    });
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

  onAdherentChange(event: any): void {
    const cin = event.value;
    console.log('📋 CIN sélectionné:', cin);
    
    this.selectedAdherent = this.adherents.find(a => a.cin === cin) || null;
    console.log('👤 Adhérent trouvé:', this.selectedAdherent);
    
    if (cin) {
      this.loadRemboursements(cin);
      this.rapportForm.patchValue({ 
        refBsPhys: '', 
        beneficiaireNom: '' 
      });
      this.selectedRemboursement = null;
      this.selectedBeneficiaire = null;
    } else {
      this.remboursements = [];
      this.beneficiaires = [];
      this.rapportForm.patchValue({ 
        refBsPhys: '', 
        beneficiaireNom: '' 
      });
    }
  }

  loadRemboursements(cin: string): void {
    this.loading = true;
    console.log('🔍 Chargement remboursements pour CIN:', cin);
    
    this.rapportService.getRemboursementsByMatricule(cin).subscribe({
      next: data => { 
        this.remboursements = data;
        this.loading = false;
        console.log('✅ Remboursements chargés:', this.remboursements);
      },
      error: (err) => { 
        this.loading = false;
        console.error('❌ Erreur chargement remboursements:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Impossible de charger les bulletins de soins' 
        }); 
      }
    });
  }

  onRemboursementChange(event: any): void {
    const refBsPhys = event.value;
    console.log('📄 RefBsPhys sélectionné:', refBsPhys);
    
    this.selectedRemboursement = this.remboursements.find(r => r.refBsPhys === refBsPhys) || null;
    console.log('📋 Remboursement trouvé:', this.selectedRemboursement);
    
    if (refBsPhys) {
      this.loadBeneficiaire(refBsPhys);
    } else {
      this.beneficiaires = [];
      this.selectedBeneficiaire = null;
      this.rapportForm.patchValue({ beneficiaireNom: '' });
    }
  }

  loadBeneficiaire(refBsPhys: string): void {
    console.log('👥 Chargement bénéficiaire pour:', refBsPhys);

    this.rapportService.getBeneficiaire(refBsPhys).subscribe({
      next: res => {
        if (res.success && res.beneficiaire) {
          this.selectedBeneficiaire = res.beneficiaire;
          this.beneficiaires = [res.beneficiaire];
          console.log('✅ Bénéficiaire trouvé:', res.beneficiaire);

          // Met à jour les champs du formulaire
          this.rapportForm.patchValue({
            beneficiaireNom: res.beneficiaire.nom
          });

          console.log('📋 Type du bénéficiaire:', res.beneficiaire.type);

          // Message visuel
          this.messageService.add({
            severity: 'info',
            summary: 'Bénéficiaire identifié',
            detail: `${res.beneficiaire.nom} (${this.formatTypeBeneficiaire(res.beneficiaire.type)})`
          });
        } else {
          this.beneficiaires = [];
          this.selectedBeneficiaire = null;
          this.messageService.add({
            severity: 'warn',
            summary: 'Aucun bénéficiaire',
            detail: 'Aucun bénéficiaire trouvé pour ce bulletin.'
          });
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement bénéficiaire:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le bénéficiaire'
        });
      }
    });
  }

  formatTypeBeneficiaire(type: string): string {
    const types: { [key: string]: string } = {
      'ADHERENT': 'Adhérent',
      'CONJOINT': 'Conjoint(e)',
      'ENFANT': 'Enfant'
    };
    return types[type] || type;
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

    console.log('📤 Soumission du formulaire:', this.rapportForm.value);

    const rapport: RapportContreVisite = {
      prestataireId: this.prestataire.persoId,
      beneficiaireId: this.selectedAdherent?.persoId || '',
      beneficiaireNom: this.rapportForm.value.beneficiaireNom,
      refBsPhys: this.rapportForm.value.refBsPhys,
      typeRapport: this.prestataire.role,
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
    console.log('🚀 Envoi au backend:', {
      matricule: this.rapportForm.value.matriculeAdherent,
      refBsPhys: this.rapportForm.value.refBsPhys,
      prestataireId: this.prestataire.persoId,
      rapport
    });

    this.rapportService.creerRapportParMatricule(
      this.rapportForm.value.matriculeAdherent,
      this.rapportForm.value.refBsPhys,
      this.prestataire.persoId,
      rapport
    ).subscribe({
      next: response => {
        this.loading = false;
        console.log('✅ Réponse backend:', response);
        
        if (response.success) {
          this.rapportCree = { ...rapport, dateRapport: new Date() };
          if (this.isDentiste && rapport.lignesDentaire) {
            this.lignesDentaireCree = JSON.parse(rapport.lignesDentaire);
          }
          this.displayRapportDialog = true;
          this.resetForm();
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succès', 
            detail: response.message 
          });
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erreur', 
            detail: response.message 
          });
        }
      },
      error: err => {
        this.loading = false;
        console.error('❌ Erreur backend:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: err.error?.message || 'Une erreur est survenue' 
        });
      }
    });
  }

  resetForm(): void {
    this.rapportForm.reset();
    this.remboursements = [];
    this.beneficiaires = [];
    this.selectedAdherent = null;
    this.selectedRemboursement = null;
    this.selectedBeneficiaire = null;
    this.selectedImage = null;
    this.imagePreview = null;
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

  onImageSelect(event: any): void {
    const file = event.files ? event.files[0] : event.target.files[0];
    if (!file) return;
    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = (e) => { 
      this.imagePreview = e.target?.result || null; 
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void { 
    this.selectedImage = null; 
    this.imagePreview = null; 
  }
}