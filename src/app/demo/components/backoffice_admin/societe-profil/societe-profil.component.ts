// src/app/demo/components/backoffice_admin/societe-profil/societe-profil.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-societe-profil',
  templateUrl: './societe-profil.component.html',
  styleUrls: ['./societe-profil.component.scss']
})
export class SocieteProfilComponent implements OnInit {
  societe: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.societe = this.authService.getCurrentSociete();
    console.log('Société connectée:', this.societe);
  }
}