import { Component } from '@angular/core';

@Component({
  selector: 'app-client-layout',
  template: `
    <div class="client-layout">
      <app-client-navbar></app-client-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .client-layout {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    
    .main-content {
      min-height: calc(100vh - 80px);
    }
  `]
})
export class ClientLayoutComponent { }