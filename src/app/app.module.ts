import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';

//New TODO mydasboard
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MesRemboursementsComponent } from './demo/components/frontoffice/mes-remboursements/mes-remboursements.component';
import { ClientNavbarComponent } from './demo/components/frontoffice/client-navbar/client-navbar.component';
import { ClientLayoutComponent } from './demo/components/frontoffice/client-layout/client-layout.component';
import { DebugRemboursementsComponent } from './debug-remboursements/debug-remboursements.component';
import { AccueilComponent } from './demo/components/frontoffice/accueil/accueil.component';
import { MessageService } from 'primeng/api';
import { ClientProfileComponent } from './demo/components/frontoffice/client-profile/client-profile.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { RemboursementStatsComponent } from './remboursement-stats/remboursement-stats.component';
import { ChartModule } from 'primeng/chart';
import { RemboursementService } from './demo/service/remboursement.service';
import { UserStatsComponent } from './user-stats/user-stats.component';
import { UserStatsService } from './demo/service/user-stats.service';
import { MesSuggestionsComponent } from './demo/components/frontoffice/mes-suggestions/mes-suggestions.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { MesRibsComponent } from './demo/components/frontoffice/mes-ribs/mes-ribs.component';
import { MesTelephonesComponent } from './demo/components/frontoffice/mes-telephones/mes-telephones.component';
import { ClientFooterComponent } from './demo/components/frontoffice/client-footer/client-footer.component';
import { ReclamationComponent } from './demo/components/frontoffice/reclamation/reclamation.component';
import { MonTelephoneComponent } from './demo/components/frontoffice/mon-telephone/mon-telephone.component';
import { PrestataireListComponent } from './demo/components/frontoffice/prestataire-list/prestataire-list.component';
import { ComplementInformationComponent } from './demo/components/frontoffice/complement-information/complement-information.component';
import { FileUploadModule } from 'primeng/fileupload';
import { PrestataireLayoutComponent } from './demo/components/prestataire/prestataire-layout/prestataire-layout.component';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { CreerRapportComponent } from './demo/components/prestataire/creer-rapport/creer-rapport.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { MesRapportsComponent } from './demo/components/prestataire/mes-rapports/mes-rapports.component';
import { PrestataireProfilComponent } from './demo/components/prestataire/prestataire-profil/prestataire-profil.component';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, MydashboardComponent, MesRemboursementsComponent, ClientNavbarComponent, ClientLayoutComponent, DebugRemboursementsComponent, AccueilComponent, ClientProfileComponent, AdminProfileComponent, RemboursementStatsComponent, UserStatsComponent, MesSuggestionsComponent, MesRibsComponent, MesTelephonesComponent, ClientFooterComponent, ReclamationComponent, MonTelephoneComponent, PrestataireListComponent, ComplementInformationComponent, PrestataireLayoutComponent, CreerRapportComponent, MesRapportsComponent, PrestataireProfilComponent
    ],
    imports: [  
 DividerModule,
    PasswordModule,

       


        FileUploadModule,
         MenuModule ,
          MessageModule,      // <-- pour <p-message>
    InputNumberModule,  // <-- pour <p-inputNumber>
    ButtonModule ,
          SidebarModule,
         TagModule,
    DialogModule,
    ToastModule, 
        AppRoutingModule,
        AppLayoutModule,
        TableModule,
        CommonModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        FormsModule,
         ReactiveFormsModule,
          FormsModule,
        DropdownModule,
        ChartModule,
        TableModule,
        ButtonModule,
            ProgressSpinnerModule, 
    ],
    providers: [
        { provide:  LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, MessageService, RemboursementService, UserStatsService,
        
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
