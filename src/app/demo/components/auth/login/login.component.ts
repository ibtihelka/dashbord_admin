import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router
    ) { }

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
                    
                    // Redirection selon le type d'utilisateur avec navigation vers les routes par défaut
                    if (response.userType === 'USER') {
                        console.log('Redirection vers /clients pour utilisateur:', response.user?.persoName);
                        this.router.navigate(['/clients']); // Redirige vers /clients (puis vers /clients/accueil)
                    } else if (response.userType === 'ADMIN') {
                        console.log('Redirection vers /admin pour admin:', response.admin?.persoName);
                        this.router.navigate(['/admin']); // Redirige vers /admin (puis vers /admin/dashboard)
                    } else {
                        console.error('Type d\'utilisateur non reconnu:', response.userType);
                        alert('Type d\'utilisateur non reconnu');
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
