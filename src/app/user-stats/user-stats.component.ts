import { Component, OnInit } from '@angular/core';
import { UserDetailedStats, UserStats, UserStatsService } from '../demo/service/user-stats.service';

@Component({
    selector: 'app-user-stats',
    templateUrl: './user-stats.component.html',
    styleUrls: ['./user-stats.component.scss']
})
export class UserStatsComponent implements OnInit {
    
    // Statistiques globales
    globalStats: UserStats | null = null;
    
    // Statistiques détaillées
    detailedStats: UserDetailedStats | null = null;
    
    // Charts data
    sexeChartData: any;
    situationChartData: any;
    evolutionChartData: any = null;
    
    // Loading states
    loading = false;
    error: string | null = null;

    constructor(private userStatsService: UserStatsService) {}

    ngOnInit(): void {
        this.loadStats();
    }

    /**
     * Charger toutes les statistiques
     */
    loadStats(): void {
        this.loading = true;
        this.error = null;

        // Charger les stats globales
        this.userStatsService.getGlobalStats().subscribe({
            next: (stats) => {
                this.globalStats = stats;
                console.log('✅ Stats globales chargées:', stats);
            },
            error: (err) => {
                console.error('❌ Erreur stats globales:', err);
                this.error = 'Erreur lors du chargement des statistiques globales';
            }
        });

        // Charger les stats détaillées
        this.userStatsService.getDetailedStats().subscribe({
            next: (stats) => {
                this.detailedStats = stats;
                this.initCharts();
                console.log('✅ Stats détaillées chargées:', stats);
            },
            error: (err) => {
                console.error('❌ Erreur stats détaillées:', err);
                this.error = 'Erreur lors du chargement des statistiques détaillées';
            }
        });

        // Charger l'évolution mensuelle
        this.userStatsService.getEvolutionStats().subscribe({
            next: (evolution) => {
                this.initEvolutionChart(evolution);
                this.loading = false;
                console.log('✅ Stats évolution chargées:', evolution);
            },
            error: (err) => {
                console.error('⚠️ Erreur stats évolution (normal si dateCreation absent):', err);
                this.evolutionChartData = null;
                this.loading = false;
            }
        });
    }

    /**
     * Initialiser les graphiques principaux
     */
    initCharts(): void {
        if (!this.detailedStats) return;

        const documentStyle = getComputedStyle(document.documentElement);

        // Chart répartition par sexe
        const sexeLabels = Object.keys(this.detailedStats.repartitionParSexe).map(sexe => {
            if (sexe === 'M' || sexe === 'H') return 'Hommes';
            if (sexe === 'F') return 'Femmes';
            return 'Non défini';
        });

        this.sexeChartData = {
            labels: sexeLabels,
            datasets: [{
                data: Object.values(this.detailedStats.repartitionParSexe),
                backgroundColor: [
                    documentStyle.getPropertyValue('--blue-500'),
                    documentStyle.getPropertyValue('--pink-500'),
                    documentStyle.getPropertyValue('--gray-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--blue-400'),
                    documentStyle.getPropertyValue('--pink-400'),
                    documentStyle.getPropertyValue('--gray-400')
                ]
            }]
        };

        // Chart répartition par situation familiale
        const situationLabels = Object.keys(this.detailedStats.repartitionParSituationFamiliale)
            .map(s => this.getSituationLabel(s));

        this.situationChartData = {
            labels: situationLabels,
            datasets: [{
                label: 'Nombre d\'adhérents',
                data: Object.values(this.detailedStats.repartitionParSituationFamiliale),
                backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                borderWidth: 1
            }]
        };
    }

    /**
     * Initialiser le graphique d'évolution mensuelle
     */
    initEvolutionChart(evolution: {[key: string]: number}): void {
        if (!evolution || Object.keys(evolution).length === 0) {
            this.evolutionChartData = null;
            return;
        }

        const documentStyle = getComputedStyle(document.documentElement);
        
        // Extraire les labels et données
        const labels = Object.keys(evolution);
        const data = Object.values(evolution);

        this.evolutionChartData = {
            labels: labels,
            datasets: [{
                label: 'Nouveaux adhérents',
                data: data,
                fill: true,
                backgroundColor: 'rgba(104, 211, 145, 0.2)', // Vert transparent
                borderColor: documentStyle.getPropertyValue('--green-500'),
                tension: 0.4,
                pointBackgroundColor: documentStyle.getPropertyValue('--green-500'),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };

        console.log('📈 Graphique évolution initialisé:', {
            labels: labels,
            data: data
        });
    }

    /**
     * Rafraîchir les statistiques
     */
    refreshStats(): void {
        this.loadStats();
    }

    /**
     * Obtenir les clés d'un objet
     */
    getObjectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    /**
     * Calculer le pourcentage
     */
    getPercentage(value: number, total: number): number {
        if (!value || !total || total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    /**
     * Obtenir le libellé d'une situation familiale
     */
    getSituationLabel(situation: string): string {
        const labels: { [key: string]: string } = {
            'C': 'Célibataire',
            'CELIBATAIRE': 'Célibataire',
            'M': 'Marié(e)',
            'MARIE': 'Marié(e)',
            'D': 'Divorcé(e)',
            'DIVORCE': 'Divorcé(e)',
            'V': 'Veuf(ve)',
            'VEUF': 'Veuf(ve)',
            'NON_DEFINI': 'Non défini'
        };
        return labels[situation.toUpperCase()] || situation;
    }

    /**
     * Obtenir l'icône pour une situation familiale
     */
    getSituationIcon(situation: string): string {
        const situationUpper = situation.toUpperCase();
        const icons: { [key: string]: string } = {
            'C': 'pi-user',
            'CELIBATAIRE': 'pi-user',
            'M': 'pi-heart',
            'MARIE': 'pi-heart',
            'D': 'pi-heart-fill',
            'DIVORCE': 'pi-heart-fill',
            'V': 'pi-user-minus',
            'VEUF': 'pi-user-minus',
            'NON_DEFINI': 'pi-question-circle'
        };
        return icons[situationUpper] || 'pi-user';
    }

    /**
     * Obtenir la couleur pour une situation familiale
     */
    getSituationColor(situation: string): string {
        const situationUpper = situation.toUpperCase();
        const colors: { [key: string]: string } = {
            'C': 'blue',
            'CELIBATAIRE': 'blue',
            'M': 'green',
            'MARIE': 'green',
            'D': 'orange',
            'DIVORCE': 'orange',
            'V': 'gray',
            'VEUF': 'gray',
            'NON_DEFINI': 'gray'
        };
        return colors[situationUpper] || 'blue';
    }
}