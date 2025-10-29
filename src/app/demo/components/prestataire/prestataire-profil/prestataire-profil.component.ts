// prestataire-profil.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrestataireService } from 'src/app/demo/service/prestataire.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Prestataire } from 'src/app/demo/api/prestataire.model';


@Component({
  selector: 'app-prestataire-profil',
  templateUrl: './prestataire-profil.component.html',
  providers: [MessageService]
})
export class PrestataireProfilComponent implements OnInit {
  prestataire: Prestataire | null = null;
  profilForm!: FormGroup;
  passwordForm!: FormGroup;
  
  loading = false;
  editMode = false;
  showPasswordDialog = false;

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

    this.initForms();
  }

  initForms(): void {
    this.profilForm = this.fb.group({
      nom: [{ value: this.prestataire?.nom, disabled: true }, Validators.required],
      role: [{ value: this.prestataire?.role, disabled: true }],
      email: [{ value: this.prestataire?.email, disabled: true }, [Validators.required, Validators.email]],
      contact: [{ value: this.prestataire?.contact, disabled: true }, Validators.required],
      adresse: [{ value: this.prestataire?.adresse, disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (this.editMode) {
      this.profilForm.get('nom')?.enable();
      this.profilForm.get('email')?.enable();
      this.profilForm.get('contact')?.enable();
      this.profilForm.get('adresse')?.enable();
    } else {
      this.profilForm.get('nom')?.disable();
      this.profilForm.get('email')?.disable();
      this.profilForm.get('contact')?.disable();
      this.profilForm.get('adresse')?.disable();
      this.profilForm.patchValue({
        nom: this.prestataire?.nom,
        email: this.prestataire?.email,
        contact: this.prestataire?.contact,
        adresse: this.prestataire?.adresse
      });
    }
  }

  onSubmitProfil(): void {
    if (this.profilForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    const updatedPrestataire: Prestataire = {
      ...this.prestataire!,
      nom: this.profilForm.value.nom,
      email: this.profilForm.value.email,
      contact: this.profilForm.value.contact,
      adresse: this.profilForm.value.adresse
    };

    this.loading = true;
    this.prestataireService.updatePrestataire(this.prestataire!.persoId, updatedPrestataire).subscribe({
      next: (response) => {
        this.prestataire = response;
        
        // Mettre à jour le localStorage
        const storedData = JSON.parse(localStorage.getItem('currentPrestataire') || '{}');
        localStorage.setItem('currentPrestataire', JSON.stringify({ ...storedData, ...response }));
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profil mis à jour avec succès'
        });
        
        this.editMode = false;
        this.profilForm.disable();
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de mettre à jour le profil'
        });
        this.loading = false;
      }
    });
  }

  openPasswordDialog(): void {
    this.showPasswordDialog = true;
    this.passwordForm.reset();
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs correctement'
      });
      return;
    }

    if (this.passwordForm.hasError('mismatch')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les mots de passe ne correspondent pas'
      });
      return;
    }

    const updatedPrestataire: Prestataire = {
      ...this.prestataire!,
      persoPassed: this.passwordForm.value.newPassword
    };

    this.loading = true;
    this.prestataireService.updatePrestataire(this.prestataire!.persoId, updatedPrestataire).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Mot de passe modifié avec succès'
        });
        this.showPasswordDialog = false;
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de modifier le mot de passe'
        });
        this.loading = false;
      }
    });
  }
}

