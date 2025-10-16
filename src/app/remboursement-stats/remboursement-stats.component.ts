import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Remboursement, RemboursementService, RemboursementStats } from '../demo/service/remboursement.service';

@Component({
    selector: 'app-remboursement-stats',
    templateUrl: './remboursement-stats.component.html',
})
export class RemboursementStatsComponent implements OnInit, OnDestroy {
    entreprises: string[] = [];
    selectedEntreprise: string | null = null;
    stats: RemboursementStats | null = null;
    loading = false;
    error: string | null = null;
    
    // Variables pour le sélecteur d'année
    anneesDisponibles: number[] = [];
    selectedAnnee: number | null = null;
    remboursementsComplets: Remboursement[] = []; // Stocke tous les remboursements
    
    statutChartData: any;
    moisChartData: any;
    chartOptions: any;
    
    subscription!: Subscription;

    constructor(
        private remboursementService: RemboursementService,
        public layoutService: LayoutService
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initCharts();
        });
    }

    ngOnInit() {
        this.loadEntreprises();
    }

    /**
     * Charger la liste des entreprises disponibles
     */
    loadEntreprises(): void {
        this.loading = true;
        this.remboursementService.getEntreprises().subscribe({
            next: (data) => {
                this.entreprises = data;
                this.loading = false;
                console.log('Entreprises chargées:', data);
            },
            error: (err) => {
                console.error('Erreur chargement entreprises:', err);
                this.error = 'Erreur lors du chargement des entreprises';
                this.loading = false;
            }
        });
    }

    /**
     * Événement déclenché quand l'utilisateur change d'entreprise
     */
    onEntrepriseChange(): void {
        if (!this.selectedEntreprise) {
            this.stats = null;
            this.anneesDisponibles = [];
            this.selectedAnnee = null;
            return;
        }
        
        this.loading = true;
        this.error = null;
        
        console.log('Chargement des stats pour:', this.selectedEntreprise);
        
        // Charger les remboursements de l'entreprise
        this.remboursementService.getRemboursementsByEntreprise(this.selectedEntreprise).subscribe({
            next: (remboursements) => {
                this.remboursementsComplets = remboursements;
                
                // Obtenir les années disponibles
                this.anneesDisponibles = this.remboursementService.getAnneesDisponibles(remboursements);
                
                // Sélectionner l'année la plus récente par défaut
                this.selectedAnnee = this.anneesDisponibles.length > 0 ? this.anneesDisponibles[0] : null;
                
                // Calculer les stats
                this.updateStats();
                
                this.loading = false;
                console.log('Statistiques chargées');
            },
            error: (err) => {
                console.error('Erreur chargement stats:', err);
                this.error = 'Erreur lors du chargement des statistiques';
                this.loading = false;
            }
        });
    }

    /**
     * Événement déclenché quand l'utilisateur change d'année
     */
    onAnneeChange(): void {
        if (this.remboursementsComplets.length > 0) {
            this.updateStats();
        }
    }

    /**
     * Mettre à jour les statistiques en fonction de l'année sélectionnée
     */
    updateStats(): void {
        this.stats = this.remboursementService.calculateStats(
            this.remboursementsComplets, 
            this.selectedAnnee || undefined
        );
        this.initCharts();
    }

    /**
     * Initialiser les graphiques avec les données chargées
     */
    initCharts(): void {
        if (!this.stats) return;

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Graphique doughnut pour les statuts
        this.statutChartData = {
            labels: Object.keys(this.stats.repartitionParStatut),
            datasets: [
                {
                    data: Object.values(this.stats.repartitionParStatut),
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--orange-500'),
                        documentStyle.getPropertyValue('--red-500'),
                        documentStyle.getPropertyValue('--purple-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--orange-400'),
                        documentStyle.getPropertyValue('--red-400'),
                        documentStyle.getPropertyValue('--purple-400')
                    ]
                }
            ]
        };

        // Graphique linéaire pour les mois (ordonné chronologiquement)
        const moisLabels = Object.keys(this.stats.repartitionParMois);
        const moisValues = Object.values(this.stats.repartitionParMois);
        
        this.moisChartData = {
            labels: moisLabels,
            datasets: [
                {
                    label: 'Nombre de remboursements',
                    data: moisValues,
                    backgroundColor: documentStyle.getPropertyValue('--primary-200'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        };

        // Options communes pour les graphiques
        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed || context.parsed.y || 0;
                            return `${label}: ${value}`;
                        }
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
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        stepSize: 1
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };
    }

    /**
     * Méthodes utilitaires pour le template
     */
    getObjectKeys(obj: any): string[] {
        return Object.keys(obj || {});
    }

    getPercentage(value: number, total: number): number {
        return this.remboursementService.calculatePercentage(value, total);
    }

    formatCurrency(value: number): string {
    if (value == null) return '0.000';
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}


    /**
     * Obtenir une classe CSS selon le statut
     */
    getStatusClass(statut: string): string {
        const statusMap: { [key: string]: string } = {
            'VALIDE': 'bg-green-100 text-green-700',
            'EN_COURS': 'bg-orange-100 text-orange-700',
            'REJETE': 'bg-red-100 text-red-700',
            'EN_ATTENTE': 'bg-blue-100 text-blue-700',
            'ANNULE': 'bg-gray-100 text-gray-700'
        };
        return statusMap[statut] || 'bg-blue-100 text-blue-700';
    }

    /**
     * Obtenir le mois avec le plus de remboursements
     */
    getMoisLePlusActif(): string {
        if (!this.stats || !this.stats.repartitionParMois) return '-';
        
        let maxMois = '';
        let maxValue = 0;
        
        Object.entries(this.stats.repartitionParMois).forEach(([mois, count]) => {
            if (count > maxValue) {
                maxValue = count;
                maxMois = mois;
            }
        });
        
        return maxValue > 0 ? `${maxMois} (${maxValue})` : 'Aucun';
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }


    getTotalMois(): number {
  const data = this.moisChartData?.datasets?.[0]?.data || [];
  return (data as number[]).reduce((a, b) => a + b, 0);
}

}