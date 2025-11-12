import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LoginRequest } from 'src/app/demo/api/login.model';

@Component({
  selector: 'app-login-prestataire',
  templateUrl: './login-prestataire.component.html',
  styleUrls: ['./login-prestataire.component.scss']
})
export class LoginPrestataireComponent {
  prestataireId: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLoginPrestataire() {
    if (!this.prestataireId || !this.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.loading = true;

    const loginRequest: LoginRequest = {
      persoId: this.prestataireId,
      persoPassed: this.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Réponse login prestataire:', response);

        if (response.success) {
          const userType = response.role || response.userType;

          if (userType === 'PRESTATAIRE' && response.prestataire) {
            // ✅ Sauvegarde de la session
            this.authService.setUserSession(response);
            
            // ✅ Redirection vers le tableau de bord prestataire
            setTimeout(() => {
              this.loading = false;
              this.router.navigate(['/prestataire/mes-rapports']);
            }, 300);
          } else {
            // ❌ Si ce n’est pas un prestataire, on refuse la connexion
            this.loading = false;
            alert('Accès refusé : cet identifiant n’appartient pas à un prestataire.');
          }
        } else {
          this.loading = false;
          alert(response.message || 'Identifiants invalides');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur de connexion:', err);

        if (err.status === 401) {
          alert('Identifiants incorrects');
        } else if (err.status === 0) {
          alert('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
        } else {
          alert(`Erreur de connexion: ${err.message || 'Erreur inconnue'}`);
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/accueil']);
  }
}
