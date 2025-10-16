// client-footer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-client-footer',
  templateUrl: './client-footer.component.html',
  styleUrls: ['./client-footer.component.scss']
})
export class ClientFooterComponent {
  // URL Google Maps pour Assurance BH
  assuranceBHLocation: string = 'https://www.google.com/maps/place/BH+Assurance/@36.8473354,10.1977368,705m/data=!3m2!1e3!4b1!4m6!3m5!1s0x12fd34c588df1b69:0xe31e2039aca69897!8m2!3d36.8473354!4d10.2003117!16s%2Fg%2F1tcx3y6r?entry=ttu&g_ep=EgoyMDI1MTAxMy4wIKXMDSoASAFQAw%3D%3D';

  // Liens utiles
  usefulLinks = [
    { 
      label: 'BH Assurance', 
      url: 'https://bh-assurance.com/',
      icon: 'pi-shield'
    },
    { 
      label: 'Retrouver une pharmacie', 
      url: 'https://cnopt.tn/fr/pharmacie-de-garde.html',
      icon: 'pi-map-marker'
    }
  ];

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  openAssuranceBHLocation(): void {
    window.open(this.assuranceBHLocation, '_blank');
  }
}