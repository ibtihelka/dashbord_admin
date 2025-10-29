import { Component, OnInit } from '@angular/core';
import { PrestataireStats, UserDetailedStats, UserStats, UserStatsService } from '../demo/service/user-stats.service';

@Component({
    selector: 'app-user-stats',
    templateUrl: './user-stats.component.html',
    styleUrls: ['./user-stats.component.scss']
})
export class UserStatsComponent implements OnInit {
    globalStats: UserStats | null = null;
    detailedStats: UserDetailedStats | null = null;
    prestataireStats: PrestataireStats | null = null;
    totalPrestataires: number = 0;
    
    loading = false;
    error: string | null = null;
    
    selectedCompany: string | null = null;
    companies: string[] = [];

    // Données pour les graphiques
    sexeChartData: any;
    situationChartData: any;

    constructor(private userStatsService: UserStatsService) {}

    ngOnInit() {
        this.loadCompanies();
        this.refreshStats();
    }

    /**
     * Charge la liste des entreprises
     */
    loadCompanies() {
        this.userStatsService.getAllCompanies().subscribe({
            next: (data) => {
                this.companies = data;
                console.log('✅ Entreprises chargées:', data);
            },
            error: (err) => {
                console.error('❌ Erreur lors du chargement des entreprises:', err);
            }
        });
    }

    /**
     * Rafraîchit toutes les statistiques
     */
    refreshStats() {
        this.loading = true;
        this.error = null;

        if (this.selectedCompany) {
            this.loadStatsByCompany(this.selectedCompany);
        } else {
            this.loadGlobalStats();
        }
    }

    /**
     * Charge les statistiques globales (toutes entreprises)
     */
    private loadGlobalStats() {
        console.log('📊 Chargement des statistiques globales...');

        // Stats globales
        this.userStatsService.getGlobalStats().subscribe({
            next: (data) => {
                this.globalStats = data;
                console.log('✅ Stats globales:', data);
            },
            error: (err) => {
                console.error('❌ Erreur stats globales:', err);
                this.error = 'Erreur lors du chargement des statistiques';
                this.loading = false;
            }
        });

        // Stats détaillées
        this.userStatsService.getDetailedStats().subscribe({
            next: (data) => {
                this.detailedStats = data;
                this.updateCharts();
                console.log('✅ Stats détaillées:', data);
            },
            error: (err) => {
                console.error('❌ Erreur stats détaillées:', err);
                this.error = 'Erreur lors du chargement des statistiques détaillées';
                this.loading = false;
            }
        });

        // Stats des prestataires
        this.userStatsService.getDetailedPrestataireStats().subscribe({
            next: (data) => {
                this.prestataireStats = data;
                this.totalPrestataires = data.total;
                this.loading = false;
                console.log('✅ Stats prestataires:', data);
            },
            error: (err) => {
                console.error('❌ Erreur stats prestataires:', err);
                this.loading = false;
            }
        });
    }

    /**
     * Charge les statistiques pour une entreprise spécifique
     */
    private loadStatsByCompany(codeEntreprise: string) {
        console.log('📊 Chargement des statistiques pour:', codeEntreprise);

        // Stats globales de l'entreprise
        this.userStatsService.getGlobalStatsByCompany(codeEntreprise).subscribe({
            next: (data) => {
                this.globalStats = data;
                console.log('✅ Stats entreprise:', data);
            },
            error: (err) => {
                console.error('❌ Erreur stats entreprise:', err);
                this.error = 'Erreur lors du chargement des statistiques';
                this.loading = false;
            }
        });

        // Stats détaillées de l'entreprise
        this.userStatsService.getDetailedStatsByCompany(codeEntreprise).subscribe({
            next: (data) => {
                this.detailedStats = data;
                this.updateCharts();
                console.log('✅ Stats détaillées entreprise:', data);
            },
            error: (err) => {
                console.error('❌ Erreur stats détaillées entreprise:', err);
                this.error = 'Erreur lors du chargement des statistiques';
                this.loading = false;
            }
        });

        // Stats prestataires de l'entreprise
        this.userStatsService.getDetailedPrestataireStatsByCompany(codeEntreprise).subscribe({
            next: (data) => {
                this.prestataireStats = data;
                this.totalPrestataires = data.total;
                this.loading = false;
                console.log('✅ Stats prestataires entreprise:', data);
            },
            error: (err) => {
                console.error('❌ Erreur stats prestataires entreprise:', err);
                this.loading = false;
            }
        });
    }

    /**
     * Met à jour les données des graphiques
     */
    private updateCharts() {
        if (!this.detailedStats) return;

        // Graphique par sexe
        const sexeData = this.detailedStats.repartitionParSexe;
        this.sexeChartData = {
            labels: ['Hommes', 'Femmes'],
            datasets: [{
                data: [sexeData['M'] || 0, sexeData['F'] || 0],
                backgroundColor: ['#3B82F6', '#EC4899'],
                hoverBackgroundColor: ['#2563EB', '#DB2777']
            }]
        };

        // Graphique par situation familiale
        const situationData = this.detailedStats.repartitionParSituationFamiliale;
        this.situationChartData = {
            labels: Object.keys(situationData).map(s => this.getSituationLabel(s)),
            datasets: [{
                label: 'Nombre d\'adhérents',
                data: Object.values(situationData),
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1
            }]
        };
    }

    /**
     * Gestion du changement d'entreprise
     */
    onCompanyChange() {
        console.log('🔄 Changement d\'entreprise:', this.selectedCompany);
        this.refreshStats();
    }

    /**
     * Efface le filtre entreprise
     */
    clearCompanyFilter() {
        this.selectedCompany = null;
        this.refreshStats();
    }

    /**
     * Calcule le pourcentage
     */
    getPercentage(value: number, total: number): number {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    /**
     * Retourne les clés d'un objet
     */
    getObjectKeys(obj: any): string[] {
        return Object.keys(obj || {});
    }

    /**
     * Retourne le label d'une situation familiale
     */
    getSituationLabel(situation: string): string {
        const labels: {[key: string]: string} = {
            'CELIBATAIRE': 'Célibataire',
            'MARIE': 'Marié(e)',
            'DIVORCE': 'Divorcé(e)',
            'VEUF': 'Veuf(ve)'
        };
        return labels[situation] || situation;
    }

    /**
     * Retourne l'icône d'une situation familiale
     */
    getSituationIcon(situation: string): string {
        const icons: {[key: string]: string} = {
            'CELIBATAIRE': 'pi-user',
            'MARIE': 'pi-users',
            'DIVORCE': 'pi-user-minus',
            'VEUF': 'pi-heart'
        };
        return icons[situation] || 'pi-user';
    }

    /**
     * Retourne la couleur d'une situation familiale
     */
    getSituationColor(situation: string): string {
        const colors: {[key: string]: string} = {
            'CELIBATAIRE': 'blue',
            'MARIE': 'green',
            'DIVORCE': 'orange',
            'VEUF': 'purple'
        };
        return colors[situation] || 'gray';
    }
}