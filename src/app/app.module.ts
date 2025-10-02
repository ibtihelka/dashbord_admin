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

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, MydashboardComponent, MesRemboursementsComponent, ClientNavbarComponent, ClientLayoutComponent, DebugRemboursementsComponent, AccueilComponent, ClientProfileComponent, AdminProfileComponent, RemboursementStatsComponent, UserStatsComponent
    ],
    imports: [ToastModule, 
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
        ButtonModule
    ],
    providers: [
        { provide:  LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, MessageService, RemboursementService, UserStatsService,
        
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
