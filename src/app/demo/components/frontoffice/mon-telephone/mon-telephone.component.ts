import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/demo/service/auth.service';
import { HttpClient } from '@angular/common/http';

interface Contact {
  contact: string;
  dateModification?: string;
}

@Component({
  selector: 'app-mon-telephone',
  templateUrl: './mon-telephone.component.html',
  styleUrls: ['./mon-telephone.component.scss'],
  providers: [MessageService]
})
export class MonTelephoneComponent implements OnInit {
  currentContact: Contact | null = null;
  loading: boolean = true;
  persoId: string = '';
  displayModifyContactDialog: boolean = false;

  modifyContactForm = {
    ancienTel: '',
    nouveauTel: '',
    confirmerTel: ''
  };

  private baseUrl = 'http://localhost:8096/api/users';

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUserContact();
  }

  loadUserContact(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non connecté'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.persoId = currentUser.persoId;
    this.loading = true;

    // Appel à l'API pour récupérer le contact
    this.http.get<{ persoId: string; contact: string }>(`${this.baseUrl}/${this.persoId}/contact`)
      .subscribe({
        next: (data) => {
          this.currentContact = { 
            contact: data.contact, 
            dateModification: new Date().toISOString() 
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du contact:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger votre numéro de téléphone'
          });
          this.loading = false;
        }
      });
  }

  openModifyContactDialog(): void {
    if (!this.currentContact) return;
    
    this.displayModifyContactDialog = true;
    this.modifyContactForm = {
      ancienTel: this.currentContact.contact,
      nouveauTel: '',
      confirmerTel: ''
    };
  }

  closeModifyContactDialog(): void {
    this.displayModifyContactDialog = false;
    this.modifyContactForm = {
      ancienTel: '',
      nouveauTel: '',
      confirmerTel: ''
    };
  }

  validatePhone(phone: string): boolean {
    // Enlever tous les espaces
    const cleanPhone = phone.replace(/\s/g, '');
    
    // Vérifier le format: +216 suivi de 8 chiffres OU 8 chiffres seulement
    const phonePattern = /^(\+216)?[0-9]{8}$/;
    return phonePattern.test(cleanPhone);
  }

  formatPhoneDisplay(phone: string): string {
    if (!phone) return '';
    
    // Enlever tous les espaces
    const cleanPhone = phone.replace(/\s/g, '');
    
    // Si le numéro commence par +216
    if (cleanPhone.startsWith('+216')) {
      const number = cleanPhone.substring(4);
      return `+216 ${number.match(/.{1,2}/g)?.join(' ') || number}`;
    }
    
    // Sinon, formater par groupes de 2
    return cleanPhone.match(/.{1,2}/g)?.join(' ') || cleanPhone;
  }

  submitModifyContact(): void {
    const cleanNouveauTel = this.modifyContactForm.nouveauTel.replace(/\s/g, '');
    const cleanConfirmerTel = this.modifyContactForm.confirmerTel.replace(/\s/g, '');

    // Validation
    if (!this.modifyContactForm.nouveauTel || !this.modifyContactForm.confirmerTel) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs'
      });
      return;
    }

    if (!this.validatePhone(cleanNouveauTel)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Format de numéro de téléphone invalide (ex: 12345678 ou +216 12345678)'
      });
      return;
    }

    if (cleanNouveauTel !== cleanConfirmerTel) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les deux numéros ne correspondent pas'
      });
      return;
    }

    if (cleanNouveauTel === this.currentContact?.contact.replace(/\s/g, '')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Le nouveau numéro est identique à l\'ancien'
      });
      return;
    }

    // Envoi de la modification au backend
    this.http.put<{ success: boolean; message: string; contact: string }>(
      `${this.baseUrl}/${this.persoId}/contact`,
      { contact: this.modifyContactForm.nouveauTel }
    ).subscribe({
      next: (response) => {
        this.currentContact = {
          contact: response.contact,
          dateModification: new Date().toISOString()
        };

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Votre numéro de téléphone a été modifié avec succès'
        });
        
        this.closeModifyContactDialog();
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Impossible de modifier le numéro de téléphone'
        });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  goToAccueil() {
  this.router.navigate(['/clients/accueil']);
}
}