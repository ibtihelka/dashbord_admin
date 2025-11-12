import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-space-selection',
  templateUrl: './space-selection.component.html',
  styleUrls: ['./space-selection.component.scss']
})
export class SpaceSelectionComponent  {

  constructor(private router: Router) {}

  navigateToLogin(spaceType: string) {
    if (spaceType === 'adherent') {
      this.router.navigate(['/login-adherent']);
    } else if (spaceType === 'admin') {
      this.router.navigate(['/login-admin']);
    } else if (spaceType === 'prestataire') {
      this.router.navigate(['/login-prestataire']);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

}
