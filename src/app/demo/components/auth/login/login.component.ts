import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginRequest } from 'src/app/demo/api/login.model';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [/* votre CSS */]
})
export class LoginComponent {
  persoId!: string;
  password!: string;
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
            this.loading = false;
            console.log('Réponse de login:', response);

            if (response.success) {
                // Sauvegarder la session
                this.authService.setUserSession(response);

                // Redirection : priorité au returnUrl
                const userType = response.userType;

                if (this.returnUrl && this.returnUrl !== '/auth/login' && this.returnUrl !== '/') {
                    this.router.navigateByUrl(this.returnUrl);
                } else {
                    // Redirection selon le type d'utilisateur
                    if (userType === 'USER') {
                        this.router.navigate(['/clients/accueil']);
                    } else if (userType === 'ADMIN') {
                        this.router.navigate(['/admin/dashboard']);
                    } else if (userType === 'PRESTATAIRE') {
                        this.router.navigate(['/prestataire/mes-rapports']);
                    } else {
                        alert('Type d\'utilisateur non reconnu');
                        this.router.navigate(['/auth/login']);
                    }
                }
            } else {
                alert(response.message || 'Identifiants invalides');
            }
        },
        error: (err) => {
            this.loading = false;
            console.error('Erreur de connexion:', err);
            alert('Erreur de connexion au serveur');
        }
    });
}

}
