import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginRequest } from 'src/app/demo/api/login.model';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  persoId: string = '';
  password: string = '';
  valCheck: string[] = ['remember'];
  loading = false;
  returnUrl: string = '/';

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si l'utilisateur a été redirigé vers le login avec un returnUrl
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

 onLogin() {
  if (!this.persoId || !this.password) {
    alert('Veuillez saisir vos identifiants');
    return;
  }

  this.loading = true;

  const loginRequest: LoginRequest = {
    persoId: this.persoId,
    persoPassed: this.password
  };

  this.authService.login(loginRequest).subscribe({
    next: (response) => {
      console.log('Réponse de login complète:', response);

      if (response.success) {
        const userType = response.role || response.userType;
        console.log('Type d\'utilisateur détecté:', userType);

        // ✅ Autoriser uniquement les utilisateurs "USER"
        if (userType !== 'USER') {
          this.loading = false;
          alert("Seuls les utilisateurs de type 'USER' peuvent se connecter sur cette interface.");
          return;
        }

        // ✅ Sauvegarde uniquement pour les USER
        this.authService.setUserSession(response);

        // ✅ Redirection vers l'accueil client
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/clients/accueil']).then(
            success => console.log('Navigation réussie:', success),
            error => console.error('Erreur de navigation:', error)
          );
        }, 300);
      } else {
        this.loading = false;
        alert(response.message || 'Identifiants invalides');
      }
    },
    error: (err) => {
      this.loading = false;
      console.error('Erreur de connexion complète:', err);

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