import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { ClientLayoutComponent } from './demo/components/frontoffice/client-layout/client-layout.component';
import { MesRemboursementsComponent } from './demo/components/frontoffice/mes-remboursements/mes-remboursements.component';
import { AccueilComponent } from './demo/components/frontoffice/accueil/accueil.component';
import { AuthGuard } from './demo/service/auth.guard';
import { ClientProfileComponent } from './demo/components/frontoffice/client-profile/client-profile.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { RemboursementStatsComponent } from './remboursement-stats/remboursement-stats.component';
import { UserStatsComponent } from './user-stats/user-stats.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // Route de redirection par défaut vers auth/login
            { 
                path: '', 
                redirectTo: '/auth/login', 
                pathMatch: 'full' 
            },
            
            // Routes protégées avec AuthGuard
            {
                path: 'admin', 
                component: AppLayoutComponent,
                canActivate: [AuthGuard],
                data: { role: 'ADMIN' },
                children: [
                    // Redirection par défaut vers dashboard pour les admins
                    { 
                        path: '', 
                        redirectTo: 'dashboard', 
                        pathMatch: 'full' 
                    },
                    { 
                        path: 'dashboard', 
                        loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) 
                    },

                     { 
                         path: 'remboursement-stats', 
                        component: RemboursementStatsComponent 
                    },

                    {
                path: 'user-stats', // NOUVELLE ROUTE
                component: UserStatsComponent
            },

                    { 
                        path: 'uikit', 
                        loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UikitModule) 
                    },
                    { 
                        path: 'utilities', 
                        loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) 
                    },
                    { 
                        path: 'documentation', 
                        loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) 
                    },
                    { 
                        path: 'blocks', 
                        loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) 
                    },
                    { 
                        path: 'pages', 
                        loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) 
                    },
                    { 
                        path: 'mydashboard', 
                        component: MydashboardComponent 
                    }, { 
                        path: 'adminProfil', 
                        component: AdminProfileComponent 
                    },

                ],
            },
            
            {
                path: 'clients',
                component: ClientLayoutComponent,
                canActivate: [AuthGuard],
                data: { role: 'USER' },
                children: [
                    { 
                        path: '', 
                        redirectTo: 'accueil', 
                        pathMatch: 'full' 
                    },
                    { 
                        path: 'accueil', 
                        component: AccueilComponent 
                    },
                    { 
                        path: 'mesRemboursements', 
                        component: MesRemboursementsComponent 
                    },
                     { 
                        path: 'profile', 
                        component: ClientProfileComponent 
                    },


                    
                    // Ajoutez vos autres routes clients ici
                    // { path: 'profile', component: ProfileComponent },
                    // { path: 'suggestions-reclamations', component: SuggestionsReclamationsComponent },
                    // { path: 'changement-rib', component: ChangementRibComponent },
                    // { path: 'changement-tel', component: ChangementTelComponent },
                ]
            },
            
            // Routes publiques
            { 
                path: 'auth', 
                loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) 
            },
            { 
                path: 'home', 
                loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) 
            },
            
            // Pages d'erreur
            { 
                path: 'pages/notfound', 
                component: NotfoundComponent 
            },
            
            // Route catch-all - doit être la dernière
            { 
                path: '**', 
                redirectTo: 'pages/notfound' 
            },
        ], { 
            scrollPositionRestoration: 'enabled', 
            anchorScrolling: 'enabled', 
            onSameUrlNavigation: 'reload' 
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
