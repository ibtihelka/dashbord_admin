import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LoginRequest } from 'src/app/demo/api/login.model';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss']
})
export class LoginAdminComponent {
  adminId: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLoginAdmin() {
    if (!this.adminId || !this.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.loading = true;

    const loginRequest: LoginRequest = {
      persoId: this.adminId,
      persoPassed: this.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Réponse login admin/société:', response);

        if (response.success) {
          const userType = response.role || response.userType;
          console.log('Type utilisateur détecté:', userType);

          // ✅ Vérification du type d'utilisateur
          if (userType === 'ADMIN' || userType === 'SOCIETE') {
            // ✅ Sauvegarde de la session
            this.authService.setUserSession(response);

            // ✅ Redirection selon le type d'utilisateur
            setTimeout(() => {
              this.loading = false;
              if (userType === 'ADMIN') {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/societe/dashboard']);
              }
            }, 300);
          } else {
            // ❌ Accès refusé
            this.loading = false;
            alert("Accès refusé : seuls les comptes ADMIN ou SOCIETE peuvent se connecter ici.");
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
