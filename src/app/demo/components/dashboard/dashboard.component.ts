// dashboard.component.ts - Version corrigée
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Famille, FamilleService, FamilleStats } from '../../service/famille.service';
import { RemboursementService } from '../../service/remboursement.service';
import { UserStatsService, UserStats } from '../../service/user-stats.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    products!: Product[];
    chartData: any;
    chartOptions: any;
    familleChartData: any;
    ageChartData: any;
    
    // Variables pour les statistiques familles
    familles: Famille[] = [];
    stats: FamilleStats | null = null;
    loading = false;
    error: string | null = null;

    // Variables pour les remboursements
    totalRemboursements = 0;
    nouveauxRemboursements = 0;
    loadingRemb = false;

    // Variables pour les adhérents
    totalAdherents = 0;
    nouveauxAdherents = 0;
    loadingAdh = false;

    subscription!: Subscription;

    constructor(
        private familleService: FamilleService,
        private productService: ProductService,
        private remboursementService: RemboursementService,
        private userStatsService: UserStatsService,
        public layoutService: LayoutService
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
            this.initFamilleCharts();
        });
    }

    ngOnInit() {
        this.loadFamilleStats();
        this.loadRemboursementCount();
        this.loadAdherentCount();
        this.initChart();
        this.productService.getProductsSmall().then(data => this.products = data);

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
    }

    /**
     * Charger le nombre de remboursements pour la carte dashboard
     */
    loadRemboursementCount(): void {
        this.loadingRemb = true;
        
        this.remboursementService.getGlobalStats().subscribe({
            next: (stats) => {
                this.totalRemboursements = stats.total || 0;
                this.nouveauxRemboursements = stats.nouveaux || 0;
                this.loadingRemb = false;
                console.log('✅ Stats remboursements chargées:', stats);
            },
            error: (err) => {
                console.error('❌ Erreur chargement remboursements:', err);
                this.totalRemboursements = 0;
                this.nouveauxRemboursements = 0;
                this.loadingRemb = false;
            }
        });
    }

    /**
     * Charger le nombre d'adhérents pour la carte dashboard - VERSION CORRIGÉE
     */
    loadAdherentCount(): void {
        this.loadingAdh = true;
        
        console.log('🔄 Chargement des stats adhérents...');
        
        this.userStatsService.getGlobalStats().subscribe({
            next: (stats: UserStats) => {
                console.log('📊 Réponse reçue:', stats);
                
                // Vérifier si les données sont valides
                if (stats && typeof stats.total === 'number') {
                    this.totalAdherents = stats.total;
                    this.nouveauxAdherents = stats.nouveaux || 0;
                    console.log('✅ Stats adhérents chargées - Total:', this.totalAdherents, 'Nouveaux:', this.nouveauxAdherents);
                } else {
                    console.warn('⚠️ Format de données inattendu:', stats);
                    this.totalAdherents = 0;
                    this.nouveauxAdherents = 0;
                }
                
                this.loadingAdh = false;
            },
            error: (err) => {
                console.error('❌ Erreur chargement adhérents:', err);
                console.error('Détails:', {
                    status: err.status,
                    statusText: err.statusText,
                    error: err.error,
                    message: err.message
                });
                
                this.totalAdherents = 0;
                this.nouveauxAdherents = 0;
                this.loadingAdh = false;
            }
        });
    }

    loadFamilleStats(): void {
        this.loading = true;
        this.error = null;
        
        this.familleService.getAllFamillesWithStats().subscribe({
            next: (data) => {
                this.familles = data.familles;
                this.stats = this.familleService.calculateStats(data.familles);
                this.stats.totalFamilles = data.totalCount;
                this.loading = false;
                this.initFamilleCharts();
            },
            error: (err) => {
                console.error('Erreur:', err);
                this.error = 'Erreur lors du chargement';
                this.loading = false;
            }
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    initFamilleCharts(): void {
        if (!this.stats) return;

        const documentStyle = getComputedStyle(document.documentElement);
        
        this.familleChartData = {
            labels: Object.keys(this.stats.repartitionParType),
            datasets: [
                {
                    data: Object.values(this.stats.repartitionParType),
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--cyan-500'),
                        documentStyle.getPropertyValue('--pink-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--cyan-400'),
                        documentStyle.getPropertyValue('--pink-400')
                    ]
                }
            ]
        };

        this.ageChartData = {
            labels: Object.keys(this.stats.repartitionParTrancheAge),
            datasets: [
                {
                    label: 'Nombre de personnes',
                    data: Object.values(this.stats.repartitionParTrancheAge),
                    backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    borderWidth: 1
                }
            ]
        };
    }

    refreshStats(): void {
        this.loadFamilleStats();
    }

    getObjectKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    getPercentage(value: number, total: number): number {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}