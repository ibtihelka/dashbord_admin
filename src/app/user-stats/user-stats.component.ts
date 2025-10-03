import { Component, OnInit } from '@angular/core';
import { UserDetailedStats, UserStats, UserStatsService } from '../demo/service/user-stats.service';

@Component({
    selector: 'app-user-stats',
    templateUrl: './user-stats.component.html',
    styleUrls: ['./user-stats.component.scss']
})
export class UserStatsComponent implements OnInit {
    
    // Entreprises disponibles
    companies: string[] = [];
    selectedCompany: string | null = null;
    
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
        this.loadCompanies();
        this.loadStats();
    }

    /**
     * Charger la liste des entreprises
     */
    loadCompanies(): void {
        this.userStatsService.getAllCompanies().subscribe({
            next: (companies) => {
                this.companies = companies;
                console.log('✅ Entreprises chargées:', companies);
            },
            error: (err) => {
                console.error('❌ Erreur lors du chargement des entreprises:', err);
            }
        });
    }

    /**
     * Gérer le changement d'entreprise sélectionnée
     */
    onCompanyChange(): void {
        console.log('🏢 Entreprise sélectionnée:', this.selectedCompany);
        this.loadStats();
    }

    /**
     * Réinitialiser le filtre (toutes les entreprises)
     */
    clearCompanyFilter(): void {
        this.selectedCompany = null;
        this.loadStats();
    }

    /**
     * Actualiser les statistiques
     */
    refreshStats(): void {
        this.loadStats();
    }

    /**
     * Charger toutes les statistiques (avec ou sans filtre entreprise)
     */
    loadStats(): void {
        this.loading = true;
        this.error = null;

        if (this.selectedCompany) {
            // Charger les stats pour une entreprise spécifique
            this.loadStatsForCompany(this.selectedCompany);
        } else {
            // Charger les stats globales (toutes entreprises)
            this.loadGlobalStats();
        }
    }

    /**
     * Charger les statistiques globales (toutes entreprises)
     */
    private loadGlobalStats(): void {
        // Stats globales
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

        // Stats détaillées
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

        // Évolution mensuelle
        this.userStatsService.getEvolutionStats().subscribe({
            next: (evolution) => {
                this.initEvolutionChart(evolution);
                this.loading = false;
                console.log('✅ Stats évolution chargées:', evolution);
            },
            error: (err) => {
                console.error('⚠️ Erreur stats évolution:', err);
                this.evolutionChartData = null;
                this.loading = false;
            }
        });
    }

    /**
     * Charger les statistiques pour une entreprise spécifique
     */
    private loadStatsForCompany(codeEntreprise: string): void {
        // Stats globales de l'entreprise
        this.userStatsService.getGlobalStatsByCompany(codeEntreprise).subscribe({
            next: (stats) => {
                this.globalStats = stats;
                console.log(`✅ Stats globales entreprise ${codeEntreprise}:`, stats);
            },
            error: (err) => {
                console.error('❌ Erreur stats globales entreprise:', err);
                this.error = 'Erreur lors du chargement des statistiques de l\'entreprise';
            }
        });

        // Stats détaillées de l'entreprise
        this.userStatsService.getDetailedStatsByCompany(codeEntreprise).subscribe({
            next: (stats) => {
                this.detailedStats = stats;
                this.initCharts();
                console.log(`✅ Stats détaillées entreprise ${codeEntreprise}:`, stats);
            },
            error: (err) => {
                console.error('❌ Erreur stats détaillées entreprise:', err);
                this.error = 'Erreur lors du chargement des statistiques détaillées de l\'entreprise';
            }
        });

        // Évolution mensuelle de l'entreprise
        this.userStatsService.getEvolutionStatsByCompany(codeEntreprise).subscribe({
            next: (evolution) => {
                this.initEvolutionChart(evolution);
                this.loading = false;
                console.log(`✅ Stats évolution entreprise ${codeEntreprise}:`, evolution);
            },
            error: (err) => {
                console.error('⚠️ Erreur stats évolution entreprise:', err);
                this.evolutionChartData = null;
                this.loading = false;
            }
        });
    }

    /**
     * Initialiser les graphiques de répartition (sexe et situation familiale)
     */
    private initCharts(): void {
        if (!this.detailedStats) return;

        // Graphique répartition par sexe
        const sexeLabels = Object.keys(this.detailedStats.repartitionParSexe).map(key => {
            if (key === 'M') return 'Hommes';
            if (key === 'F') return 'Femmes';
            return 'Non défini';
        });

        this.sexeChartData = {
            labels: sexeLabels,
            datasets: [
                {
                    data: Object.values(this.detailedStats.repartitionParSexe),
                    backgroundColor: ['#42A5F5', '#EC407A', '#66BB6A'],
                    hoverBackgroundColor: ['#64B5F6', '#F06292', '#81C784']
                }
            ]
        };

        // Graphique répartition par situation familiale
        const situationLabels = Object.keys(this.detailedStats.repartitionParSituationFamiliale)
            .map(key => this.getSituationLabel(key));

        this.situationChartData = {
            labels: situationLabels,
            datasets: [
                {
                    label: 'Nombre d\'adhérents',
                    data: Object.values(this.detailedStats.repartitionParSituationFamiliale),
                    backgroundColor: ['#AB47BC', '#EF5350', '#26A69A', '#FF7043', '#5C6BC0'],
                    hoverBackgroundColor: ['#BA68C8', '#EF5350', '#26C6DA', '#FF8A65', '#7986CB']
                }
            ]
        };
    }

    /**
     * Initialiser le graphique d'évolution mensuelle
     */
    private initEvolutionChart(evolution: {[key: string]: number}): void {
        const labels = Object.keys(evolution);
        const data = Object.values(evolution);

        this.evolutionChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Nouveaux adhérents',
                    data: data,
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4,
                    backgroundColor: '#42A5F5'
                }
            ]
        };
    }

    /**
     * Calculer le pourcentage
     */
    getPercentage(value: number, total: number): string {
        if (total === 0) return '0';
        return ((value / total) * 100).toFixed(1);
    }

    /**
     * Obtenir les clés d'un objet (pour *ngFor)
     */
    getObjectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    /**
     * Obtenir le libellé d'une situation familiale
     */
    getSituationLabel(situation: string): string {
        const labels: { [key: string]: string } = {
            'CELIBATAIRE': 'Célibataire',
            'MARIE': 'Marié(e)',
            'DIVORCE': 'Divorcé(e)',
            'VEUF': 'Veuf/Veuve',
            'CONCUBINAGE': 'Concubinage',
            'PACSE': 'Pacsé(e)'
        };
        return labels[situation] || situation;
    }

    /**
     * Obtenir l'icône pour une situation familiale
     */
    getSituationIcon(situation: string): string {
        const icons: { [key: string]: string } = {
            'CELIBATAIRE': 'pi-user',
            'MARIE': 'pi-heart',
            'DIVORCE': 'pi-heart-slash',
            'VEUF': 'pi-times-circle',
            'CONCUBINAGE': 'pi-users',
            'PACSE': 'pi-link'
        };
        return icons[situation] || 'pi-question-circle';
    }

    /**
     * Obtenir la couleur pour une situation familiale
     */
    getSituationColor(situation: string): string {
        const colors: { [key: string]: string } = {
            'CELIBATAIRE': 'blue',
            'MARIE': 'pink',
            'DIVORCE': 'orange',
            'VEUF': 'gray',
            'CONCUBINAGE': 'teal',
            'PACSE': 'purple'
        };
        return colors[situation] || 'gray';
    }
}