import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent {

  constructor(private router: Router) { }

  goToRemboursements(): void {
    this.router.navigate(['/clients/mesRemboursements']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
