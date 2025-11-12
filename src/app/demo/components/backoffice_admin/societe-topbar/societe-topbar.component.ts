// src/app/demo/components/backoffice_admin/societe-topbar/societe-topbar.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from '../../../../layout/service/app.layout.service';

@Component({
    selector: 'app-societe-topbar',
    templateUrl: './societe-topbar.component.html',
    styleUrls: ['./societe-topbar.component.scss']
})
export class SocieteTopbarComponent {

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    societeNom: string = '';

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router
    ) {
        const societe = this.authService.getCurrentSociete();
        this.societeNom = societe?.persoName || societe?.persoId || 'Société';
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/accueil']);
    }
}