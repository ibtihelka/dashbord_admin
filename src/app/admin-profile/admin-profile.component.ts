import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../demo/service/auth.service';
import { Admin } from '../demo/api/login.model';


@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  admin: Admin | null = null;
  profileForm: FormGroup;
  isEditing = false;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      persoName: ['', [Validators.required, Validators.minLength(2)]],
      site: ['', [Validators.required]],
      type: ['', [Validators.required]],
      codeEntite: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAdminProfile(): void {
    this.authService.currentAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe(admin => {
        if (admin) {
          this.admin = admin;
          this.populateForm();
        }
      });
  }

  private populateForm(): void {
    if (this.admin) {
      this.profileForm.patchValue({
        persoName: this.admin.persoName,
        site: this.admin.site,
        type: this.admin.type,
        codeEntite: this.admin.codeEntite
      });
    }
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.populateForm(); // Reset form if canceling
    }
    this.isEditing = !this.isEditing;
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.admin) {
      this.loading = true;
      
      const updatedAdmin: Admin = {
        ...this.admin,
        persoName: this.profileForm.value.persoName,
        site: this.profileForm.value.site,
        type: this.profileForm.value.type,
        codeEntite: this.profileForm.value.codeEntite
      };

      // Ici vous pouvez ajouter un appel HTTP pour mettre à jour le profil
      // this.http.put(`${baseUrl}/admin/${this.admin.persoId}`, updatedAdmin)
      //   .subscribe(response => {
      //     // Mettre à jour l'état local
      //     this.authService.updateCurrentAdmin(response);
      //     this.isEditing = false;
      //     this.loading = false;
      //   });

      // Pour l'instant, on simule la mise à jour locale
      setTimeout(() => {
        this.admin = updatedAdmin;
        this.isEditing = false;
        this.loading = false;
        console.log('Profil mis à jour:', updatedAdmin);
      }, 1000);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} est requis`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}