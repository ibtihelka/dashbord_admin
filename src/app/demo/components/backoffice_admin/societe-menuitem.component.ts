// src/app/demo/components/backoffice_admin/societe-menuitem/societe-menuitem.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: '[app-menuitem]',
    template: `
        <ng-container>
            <a [routerLink]="item.routerLink" 
               *ngIf="item.routerLink"
               routerLinkActive="active-route"
               [routerLinkActiveOptions]="{exact: false}">
                <i [class]="item.icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
            </a>
            <a (click)="itemClick($event)" 
               *ngIf="!item.routerLink"
               style="cursor: pointer;">
                <i [class]="item.icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
            </a>
        </ng-container>
    `
})
export class SocieteMenuitemComponent implements OnInit {
    @Input() item: any;
    @Input() index!: number;
    @Input() root!: boolean;

    constructor(private router: Router) {}

    ngOnInit() {}

    itemClick(event: Event) {
        if (this.item.command) {
            this.item.command({ originalEvent: event, item: this.item });
        }
    }
}