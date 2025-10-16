import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/demo/api/login.model';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent  implements OnInit{

   currentUser: User | null = null;
    private userSubscription: Subscription = new Subscription();
   

  constructor(private router: Router,
    private authService: AuthService
  ) { }

  goToRemboursements(): void {
    this.router.navigate(['/clients/mesRemboursements']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }


    getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return this.currentUser.persoName 
      ? `${this.currentUser.persoName}` 
      : this.currentUser.persoName || this.currentUser.persoId || 'Utilisateur';
  }


  
  ngOnInit() {
    // S'abonner aux changements de l'utilisateur connecté
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
      }
    );}
}
