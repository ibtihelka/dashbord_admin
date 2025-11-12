import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from '../../../../layout/service/app.layout.service';

@Component({
    selector: 'app-societe-menu',
    templateUrl: './societe-menu.component.html',
    styleUrls: ['./societe-menu.component.scss']
})
export class SocieteMenuComponent implements OnInit {

    model: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Menu Principal',
                items: [
                   
                    { 
                        label: 'Dashboard', 
                        icon: 'pi pi-fw pi-chart-line', 
                        routerLink: ['/societe/dashboard'] 
                    },
                    { 
                        label: 'Liste des Bordereaux', 
                        icon: 'pi pi-fw pi-list', 
                        routerLink: ['/societe/bordereaux'] 
                    }
                ]
            },
            {
                label: 'Mon Compte',
                items: [
                    { 
                        label: 'Profil', 
                        icon: 'pi pi-fw pi-user', 
                        routerLink: ['/societe/profil'] 
                    },
                    
                    { 
                        label: 'Déconnexion', 
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => this.logout()
                    }
                ]
            }
        ];
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/accueil']);
    }
}