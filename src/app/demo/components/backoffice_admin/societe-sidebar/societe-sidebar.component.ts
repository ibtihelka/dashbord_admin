// src/app/demo/components/backoffice_admin/societe-sidebar/societe-sidebar.component.ts
import { Component, ElementRef } from '@angular/core';
import { LayoutService } from '../../../../layout/service/app.layout.service';

@Component({
    selector: 'app-societe-sidebar',
    templateUrl: './societe-sidebar.component.html',
    styleUrls: ['./societe-sidebar.component.scss']
})
export class SocieteSidebarComponent {
    constructor(
        public layoutService: LayoutService, 
        public el: ElementRef
    ) { }
}