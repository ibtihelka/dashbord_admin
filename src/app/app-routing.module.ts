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
import { MesSuggestionsComponent } from './demo/components/frontoffice/mes-suggestions/mes-suggestions.component';
import { MesRibsComponent } from './demo/components/frontoffice/mes-ribs/mes-ribs.component';
import { ReclamationComponent } from './demo/components/frontoffice/reclamation/reclamation.component';
import { MonTelephoneComponent } from './demo/components/frontoffice/mon-telephone/mon-telephone.component';
import { ComplementInformationComponent } from './demo/components/frontoffice/complement-information/complement-information.component';
import { PrestataireLayoutComponent } from './demo/components/prestataire/prestataire-layout/prestataire-layout.component';
import { CreerRapportComponent } from './demo/components/prestataire/creer-rapport/creer-rapport.component';
import { MesRapportsComponent } from './demo/components/prestataire/mes-rapports/mes-rapports.component';
import { PrestataireProfilComponent } from './demo/components/prestataire/prestataire-profil/prestataire-profil.component';
import { SpaceSelectionComponent } from './space-selection/space-selection.component';
import { LoginComponent } from './demo/components/auth/login/login.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { LoginPrestataireComponent } from './login-prestataire/login-prestataire.component';
import { SocieteBordereauxComponent } from './demo/components/backoffice_admin/societe-bordereaux/societe-bordereaux.component';
import { SocieteLayoutComponent } from './demo/components/backoffice_admin/societe-layout/societe-layout.component';
import { SocieteDashboardComponent } from './demo/components/backoffice_admin/societe-dashboard/societe-dashboard.component';
import { SocieteProfilComponent } from './demo/components/backoffice_admin/societe-profil/societe-profil.component';


@NgModule({
    imports: [
        RouterModule.forRoot([
            { 
                path: '', 
                redirectTo: '/accueil', 
                pathMatch: 'full' 
            },
            {
                path: 'societe',
                component: SocieteLayoutComponent,
                canActivate: [AuthGuard],
                data: { role: 'SOCIETE' },
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', component: SocieteDashboardComponent },
                    { path: 'bordereaux', component: SocieteBordereauxComponent },
                    { path: 'profil', component: SocieteProfilComponent }
                ]
            },
            
            // ROUTES ADMIN
            {
                path: 'admin', 
                component: AppLayoutComponent,
                canActivate: [AuthGuard],
                data: { role: 'ADMIN' },
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'remboursement-stats', component: RemboursementStatsComponent },
                    { path: 'user-stats', component: UserStatsComponent },
                    { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UikitModule) },
                    { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
                    { path: 'mydashboard', component: MydashboardComponent },
                    { path: 'adminProfil', component: AdminProfileComponent },
                ],
            },
            
            // ROUTES CLIENTS
            {
                path: 'clients',
                component: ClientLayoutComponent,
                canActivate: [AuthGuard],
                data: { role: 'USER' },
                children: [
                    { path: '', redirectTo: 'accueil', pathMatch: 'full' },
                    { path: 'accueil', component: AccueilComponent },
                    { path: 'mesRemboursements', component: MesRemboursementsComponent },
                    { path: 'profile', component: ClientProfileComponent },
                    { path: 'mes-suggestions', component: MesSuggestionsComponent },
                    { path: 'rib', component: MesRibsComponent },
                    { path: 'complement-information', component: ComplementInformationComponent },
                    { path: 'reclamations', component: ReclamationComponent },
                    { path: 'tel', component: MonTelephoneComponent }
                ]
            },

            // ROUTES PRESTATAIRE (NOUVEAU)
            {
                path: 'prestataire',
                component: PrestataireLayoutComponent,
                canActivate: [AuthGuard],
                data: { role: 'PRESTATAIRE' },
                children: [
                    { path: '', redirectTo: 'mes-rapports', pathMatch: 'full' },
                  
                    { 
                        path: 'creer-rapport', 
                        component: CreerRapportComponent 
                    },
                    { 
                        path: 'mes-rapports', 
                        component: MesRapportsComponent 
                    },
                      { 
                        path: 'profil', 
                        component: PrestataireProfilComponent 
                    },
                   
                ]
            },
            
            // Routes publiques
            { 
                path: 'auth', 
                loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) 
            },
            { 
                path: 'home1', 
                loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) 
            },




 
  {
    path: 'accueil',
    component: SpaceSelectionComponent
  },
  {
    path: 'login-adherent',
    component: LoginComponent
  },
  {
    path: 'login-admin',
    component: LoginAdminComponent
  },
  {
    path: 'login-prestataire',
    component: LoginPrestataireComponent
  }
,



            
            // Pages d'erreur
            { 
                path: 'pages/notfound', 
                component: NotfoundComponent 
            },
            
            // Route catch-all
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