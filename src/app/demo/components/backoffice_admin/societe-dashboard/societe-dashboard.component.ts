import { Component, OnInit } from '@angular/core';
import { BordereauService } from 'src/app/demo/service/bordereau.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { BordereauStats, BordereauSummary } from 'src/app/demo/api/bordereau-stats.model';

@Component({
  selector: 'app-societe-dashboard',
  templateUrl: './societe-dashboard.component.html',
  styleUrls: ['./societe-dashboard.component.scss']
})
export class SocieteDashboardComponent implements OnInit {
  societePrefix: string = '';
  totalBordereaux: number = 0;
  totalDepense: number = 0;
  totalRembourse: number = 0;
  bordereaux: BordereauSummary[] = [];

  selectedBordereau: string | null = null;
  bordereauStats: BordereauStats | null = null;

  loadingGlobal: boolean = true;
  loadingDetails: boolean = false;

  chartOptions: any;

  constructor(
    private authService: AuthService,
    private bordereauService: BordereauService
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    const societe = this.authService.getCurrentSociete();
    if (societe) {
      this.societePrefix = this.extractPrefix(societe.persoId);
      this.loadGlobalStats();
    }
  }

  private extractPrefix(persoId: string): string {
    const match = persoId.match(/^([^_-]+)/);
    return match ? match[1] : persoId;
  }

  loadGlobalStats(): void {
    this.loadingGlobal = true;
    this.bordereauService.getGlobalBordereauxStats(this.societePrefix).subscribe({
      next: (data) => {
        this.totalBordereaux = data.totalBordereaux;
        this.totalDepense = data.totalDepense;
        this.totalRembourse = data.totalRembourse;
        this.bordereaux = data.bordereaux.sort((a, b) =>
          b.dateBordereau.getTime() - a.dateBordereau.getTime()
        );
        this.loadingGlobal = false;
      },
      error: (err) => {
        console.error('Erreur chargement statistiques globales:', err);
        this.loadingGlobal = false;
      }
    });
  }

  selectBordereau(refBordereau: string): void {
    if (this.selectedBordereau === refBordereau) {
      this.selectedBordereau = null;
      this.bordereauStats = null;
      return;
    }

    this.selectedBordereau = refBordereau;
    this.loadingDetails = true;

    this.bordereauService.getBordereauStats(refBordereau).subscribe({
      next: (stats) => {
        this.bordereauStats = stats;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Erreur chargement statistiques bordereau:', err);
        this.loadingDetails = false;
      }
    });
  }



  private initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 10,
            usePointStyle: true
          }
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  formatCurrency(value: number): string {
    if (!value) return '0.00 DT';
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace('TND', 'DT');
  }

  formatPercentage(value: number): string {
    if (!value) return '0.00%';
    return `${value.toFixed(2)}%`;
  }

  getTauxRemboursementGlobal(): number {
    return this.totalDepense > 0
      ? (this.totalRembourse / this.totalDepense) * 100
      : 0;
  }

getBeneficiairesChartData(): any {
  if (!this.bordereauStats) return null;

  const data = {
    labels: ['Adhérents', 'Conjoints', 'Enfants', 'Parents'],
    datasets: [{
      data: [
        this.bordereauStats.nombreAdherents || 0,
        this.bordereauStats.nombreConjoints || 0,
        this.bordereauStats.nombreEnfants || 0,
        this.bordereauStats.nombreParents || 0
      ],
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
      borderWidth: 0
    }]
  };

  console.log('👨‍👩‍👧‍👦 Données graphique bénéficiaires:', data);
  return data;
}

getMontantsParTypeChartData(): any {
  if (!this.bordereauStats || !this.bordereauStats.repartitionMontantsParType) {
    return null;
  }

  const repartition = this.bordereauStats.repartitionMontantsParType;
  const labels = Object.keys(repartition);
  const values = Object.values(repartition).map(v => Number(v) || 0);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Montant remboursé (DT)',
      data: values,
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
      borderWidth: 0
    }]
  };

  console.log('💰 Données graphique montants:', data);
  return data;
}

getStatutChartData(): any {
  if (!this.bordereauStats || !this.bordereauStats.repartitionParStatut) {
    return null;
  }

  const repartition = this.bordereauStats.repartitionParStatut;
  const labels = Object.keys(repartition);
  const values = Object.values(repartition).map(v => Number(v) || 0);

  const data = {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#9E9E9E', '#2196F3'],
      borderWidth: 0
    }]
  };

  console.log('📊 Données graphique statuts:', data);
  return data;
}

getTrancheAgeChartData(): any {
  if (!this.bordereauStats || !this.bordereauStats.repartitionParTrancheAge) {
    return null;
  }

  const repartition = this.bordereauStats.repartitionParTrancheAge;
  const labels = Object.keys(repartition).sort();
  const values = labels.map(l => repartition[l] || 0);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Nombre de bénéficiaires',
      data: values,
      backgroundColor: '#66BB6A',
      borderWidth: 0
    }]
  };

  console.log('👨‍👩‍👧‍👦 Données graphique âges:', data);
  return data;
}


  
}
