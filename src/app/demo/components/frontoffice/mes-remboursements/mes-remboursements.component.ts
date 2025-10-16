import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Remboursement, RemboursementService } from 'src/app/demo/service/remboursement.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { User } from 'src/app/demo/api/login.model';

@Component({
  selector: 'app-mes-remboursements',
  templateUrl: './mes-remboursements.component.html',
  styleUrls: ['./mes-remboursements.component.scss']
})
export class MesRemboursementsComponent implements OnInit, OnDestroy {
  remboursements: Remboursement[] = [];
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  
  private authSubscription?: Subscription;

  constructor(
    private remboursementService: RemboursementService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Initialisation du composant Mes Remboursements');
    
    // Vérifier si l'utilisateur est connecté
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('Aucun utilisateur connecté');
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('Utilisateur connecté:', this.currentUser.persoName, '(ID:', this.currentUser.persoId, ')');
    
    // S'abonner aux changements d'authentification
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/auth/login']);
      }
    });

    this.loadRemboursements();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadRemboursements() {
    if (!this.currentUser) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;
    
    console.log('=== Chargement des remboursements ===');
    console.log('Utilisateur:', this.currentUser.persoId, '-', this.currentUser.persoName);
    
    this.remboursementService.getMyRemboursements()
      .subscribe({
        next: (data) => {
          console.log('✅ Succès - Remboursements récupérés:', data);
          console.log('Nombre de remboursements:', data.length);
          
          // Filtrer pour s'assurer qu'on a bien les remboursements de cet utilisateur
          this.remboursements = data.filter(r => r.persoId === this.currentUser?.persoId);
          
          console.log('Remboursements filtrés pour cet utilisateur:', this.remboursements.length);
          this.loading = false;
          
          if (this.remboursements.length > 0) {
            console.log('Premier remboursement:', this.remboursements[0]);
          }
        },
        error: (err) => {
          console.error('❌ Erreur lors du chargement des remboursements:');
          console.error('Status:', err.status);
          console.error('Message:', err.message);
          console.error('URL:', err.url);
          console.error('Erreur complète:', err);
          
          this.loading = false;
          
          // Messages d'erreur spécifiques
          if (err.status === 401) {
            this.error = 'Erreur d\'authentification. Veuillez vous reconnecter.';
            // Optionnel : rediriger vers login après un délai
            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/auth/login']);
            }, 3000);
          } else if (err.status === 404) {
            this.error = `Aucun remboursement trouvé pour l'utilisateur ${this.currentUser?.persoName}.`;
          } else if (err.status === 0) {
            this.error = 'Impossible de se connecter au serveur. Vérifiez que l\'API est démarrée sur http://localhost:8096';
          } else {
            this.error = `Erreur ${err.status}: ${err.message || 'Erreur inconnue'}`;
          }
        }
      });
  }

  // Méthode pour recharger les données
  reload() {
    console.log('Rechargement manuel des remboursements...');
    this.loadRemboursements();
  }

  // Méthodes de formatage
  formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatAmount(amount: number): string {
    if (amount == null) return '0.000 TND';
    return amount.toFixed(3) + ' TND';
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('règlement effectué') || statusLower.includes('effectué')) {
      return 'status-completed';
    } else if (statusLower.includes('en cours')) {
      return 'status-pending';
    } else if (statusLower.includes('rejeté') || statusLower.includes('voir obs')) {
      return 'status-rejected';
    } else {
      return 'status-default';
    }
  }

  // Actions sur les remboursements
  onConsulter(remboursement: Remboursement) {
    console.log('Consultation du remboursement:', remboursement.refBsPhys);
    console.log('Détails:', remboursement);
    // TODO: Implémenter la logique de consultation
    // Par exemple : ouvrir un modal ou naviguer vers une page de détail
  }

 

  trackByRefBs(index: number, item: Remboursement): string {
    return item.refBsPhys;
  }

  // Informations de debug
  getDebugInfo(): string {
    if (!this.currentUser) {
      return 'Aucun utilisateur connecté';
    }
    return `Bonjour ${this.currentUser.persoName} `;
  }

  // Méthode pour se déconnecter
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }


  onReclamation(remboursement: Remboursement) {
  // Naviguer vers la page réclamations avec le refBsPhys en paramètre
  this.router.navigate(['/clients/reclamations'], {
    queryParams: { refBsPhys: remboursement.refBsPhys }
  });
}
}