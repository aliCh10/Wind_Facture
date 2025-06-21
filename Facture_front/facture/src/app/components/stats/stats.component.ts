import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartOptions } from 'chart.js/auto';
import { FactureServiceService } from '../../services/facture-service.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-stats',
  standalone: false,
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topClientsChart') topClientsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topServicesChart') topServicesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topModelesChart') topModelesChartRef!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  error: string | null = null;
  totalRevenue = 0;
  totalInvoices = 0;
  hasData = false; // Add hasData property
  currentYear = new Date().getFullYear();

  private revenueChart?: Chart;
  private topClientsChart?: Chart;
  private topServicesChart?: Chart;
  private topModelesChart?: Chart;

  constructor(
    private factureService: FactureServiceService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Load data in ngAfterViewInit
  }

  ngAfterViewInit(): void {
    console.log('Canvas refs:', {
      revenue: !!this.revenueChartRef?.nativeElement,
      topClients: !!this.topClientsChartRef?.nativeElement,
      topServices: !!this.topServicesChartRef?.nativeElement,
      topModeles: !!this.topModelesChartRef?.nativeElement
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private loadData(): void {
    this.isLoading = true;
    this.error = null;

    const startDate = `${this.currentYear}-01-01`;
    const endDate = `${this.currentYear}-12-31`;

    forkJoin({
      factures: this.factureService.getFactures().pipe(
        catchError((err) => {
          console.error('Error fetching factures:', err);
          return of({ content: [], currentPage: 0, totalItems: 0, totalPages: 0, pageSize: 10 });
        })
      ),
      revenue: this.factureService.getRevenueByPeriod('month', startDate, endDate).pipe(
        catchError((err) => {
          console.error('Error fetching revenue:', err);
          return of({});
        })
      ),
      topClients: this.factureService.getTopClientsByRevenue(5).pipe(
        catchError((err) => {
          console.error('Error fetching top clients:', err);
          return of([]);
        })
      ),
      topServices: this.factureService.getTopServicesByRevenue(5).pipe(
        catchError((err) => {
          console.error('Error fetching top services:', err);
          return of([]);
        })
      ),
      topModeles: this.factureService.getTopModelesByUsage(5).pipe(
        catchError((err) => {
          console.error('Error fetching top modeles:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        console.log('Factures:', data.factures);
        console.log('Revenue:', data.revenue);
        console.log('Top Clients:', data.topClients);
        console.log('Top Services:', data.topServices);
        console.log('Top Modeles:', data.topModeles);
        this.processData(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ForkJoin error:', err);
        this.error = this.translate.instant('stats.error') || 'Error loading data';
        this.isLoading = false;
      },
      complete: () => {
        console.log('ForkJoin completed');
      }
    });
  }

 private processData(data: any): void {
    if (!data.factures?.content || !data.revenue || !data.topClients || !data.topServices || !data.topModeles) {
      console.error('Incomplete data received:', data);
      this.error = this.translate.instant('stats.noData') || 'No data available';
      this.hasData = false;
      this.isLoading = false;
      return;
    }

  this.totalInvoices = data.factures.content.length;
  this.totalRevenue = data.factures.content.reduce((sum: number, facture: any) => {
    const amount = facture.totalAmount || 0;
    console.log('Facture:', facture, 'Amount:', amount);
    return sum + amount;
  }, 0);
  console.log('Total Invoices:', this.totalInvoices, 'Total Revenue:', this.totalRevenue);

  this.hasData =
    this.totalInvoices > 0 ||
    Object.keys(data.revenue).length > 0 ||
    data.topClients.length > 0 ||
    data.topServices.length > 0 ||
    data.topModeles.length > 0;
  console.log('hasData:', this.hasData); // Add this log

  const revenueData = this.formatRevenueData(data.revenue);
  const clientsData = data.topClients.map((client: any) => ({
    name: client.clientName || `Client ${client.clientId || 'Unknown'}`,
    revenue: client.totalRevenue || 0
  }));

  try {
    this.createRevenueChart(revenueData);
    this.createTopClientsChart(clientsData);
    this.createTopServicesChart(data.topServices);
    this.createTopModelesChart(data.topModeles);
  } catch (err) {
    console.error('Error creating charts:', err);
  }
}

  private formatRevenueData(revenueData: any): { labels: string[], data: number[] } {
    const monthNames = [
      this.translate.instant('months.jan') || 'Jan',
      this.translate.instant('months.feb') || 'Feb',
      this.translate.instant('months.mar') || 'Mar',
      this.translate.instant('months.apr') || 'Apr',
      this.translate.instant('months.may') || 'May',
      this.translate.instant('months.jun') || 'Jun',
      this.translate.instant('months.jul') || 'Jul',
      this.translate.instant('months.aug') || 'Aug',
      this.translate.instant('months.sep') || 'Sep',
      this.translate.instant('months.oct') || 'Oct',
      this.translate.instant('months.nov') || 'Nov',
      this.translate.instant('months.dec') || 'Dec'
    ];

    const data = Array(12).fill(0);
    console.log('Revenue Data Keys:', Object.keys(revenueData));

    Object.entries(revenueData || {}).forEach(([key, value]) => {
      const parts = key.split('-');
      if (parts.length !== 2) {
        console.warn(`Invalid revenue key format: ${key}`);
        return;
      }
      const [year, month] = parts;
      const monthIndex = parseInt(month) - 1;
      if (monthIndex >= 0 && monthIndex < 12 && typeof value === 'number') {
        data[monthIndex] = value;
      } else {
        console.warn(`Invalid month or value: ${key}=${value}`);
      }
    });

    console.log('Formatted Revenue Data:', { labels: monthNames, data });
    return { labels: monthNames, data };
  }

  private createRevenueChart(chartData: { labels: string[], data: number[] }): void {
    if (!this.revenueChartRef?.nativeElement) {
      console.error('Revenue chart canvas not found');
      return;
    }

    this.destroyChart(this.revenueChart);
    console.log('Revenue Chart Data:', chartData);

    try {
      const ctx = this.revenueChartRef.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('Failed to get 2D context for revenue chart');
        return;
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

      this.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels.length ? chartData.labels : ['No Data'],
          datasets: [{
            label: this.translate.instant('stats.revenue') || 'Revenue',
            data: chartData.data.length ? chartData.data : [0],
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: this.getChartOptions('stats.charts.revenue', 'stats.amount', true)
      });
    } catch (err) {
      console.error('Error initializing revenue chart:', err);
    }
  }

  private createTopClientsChart(clientsData: any[]): void {
  if (!this.topClientsChartRef?.nativeElement) {
    console.error('Top clients chart canvas not found');
    return;
  }

  const labels = clientsData.map(item => item.name || 'Unknown');
  const data = clientsData.map(item => item.revenue || 0);
  console.log('Top Clients Chart Data:', { labels, data });

  this.destroyChart(this.topClientsChart);

  try {
    const ctx = this.topClientsChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for top clients chart');
      return;
    }

    this.topClientsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: this.translate.instant('stats.revenue') || 'Revenue',
          data: data.length ? data : [0],
          backgroundColor: '#FFD700', // Yellow background for bars
          borderColor: '#1A237E', // Navy border for contrast
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        ...this.getChartOptions('stats.charts.clients', 'stats.amount'),
        scales: {
          x: {
            ticks: {
              // Remove truncation to show full client names
              callback: function(value: number | string) {
                const numericValue = typeof value === 'string' ? parseInt(value) : value;
                return labels[numericValue] || '';
              },
              // Adjust font size and max rotation for readability
              font: { size: 12 },
              maxRotation: 45, // Rotate labels if needed for long names
              minRotation: 0,
              autoSkip: false // Ensure all labels are shown
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.translate.instant('stats.amount') || 'Amount',
              color: '#1A237E', // Navy color for axis title
              font: { size: 12, weight: 500 }
            },
            grid: { color: '#e5e7eb' },
            ticks: { color: '#1A237E' } // Navy color for ticks
          }
        },
        plugins: {
          title: {
            display: true,
            text: this.translate.instant('stats.charts.clients', { year: this.currentYear }) || 'Top Clients',
            font: { size: 16, weight: 500 },
            color: '#1A237E', // Navy color for title
            padding: { top: 10, bottom: 20 }
          },
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A237E', // Navy tooltip background
            titleColor: '#FFD700', // Yellow tooltip title
            bodyColor: '#FFD700', // Yellow tooltip text
            padding: 12,
            cornerRadius: 6,
            displayColors: false
          }
        }
      }
    });
  } catch (err) {
    console.error('Error initializing top clients chart:', err);
  }
}
  private createTopServicesChart(servicesData: any[]): void {
    if (!this.topServicesChartRef?.nativeElement) {
      console.error('Top services chart canvas not found');
      return;
    }

    const labels = servicesData.map(item => 
      item.serviceName || this.translate.instant('stats.serviceId', { id: item.serviceId || 'Unknown' }) || 'Unknown'
    );
    const data = servicesData.map(item => item.totalRevenue || 0);
    console.log('Top Services Chart Data:', { labels, data });

    this.destroyChart(this.topServicesChart);

    try {
      const ctx = this.topServicesChartRef.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('Failed to get 2D context for top services chart');
        return;
      }

      this.topServicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            label: this.translate.instant('stats.revenue') || 'Revenue',
            data: data.length ? data : [0],
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderRadius: 6,
            borderWidth: 0
          }]
        },
        options: this.getChartOptions('stats.charts.services', 'stats.amount')
      });
    } catch (err) {
      console.error('Error initializing top services chart:', err);
    }
  }

  private createTopModelesChart(modelesData: any[]): void {
    if (!this.topModelesChartRef?.nativeElement) {
      console.error('Top modeles chart canvas not found');
      return;
    }

    const labels = modelesData.map(item => 
      item.modeleName || this.translate.instant('stats.templateId', { id: item.modeleId || 'Unknown' }) || 'Unknown'
    );
    const data = modelesData.map(item => item.usageCount || 0);
    console.log('Top Modeles Chart Data:', { labels, data });

    this.destroyChart(this.topModelesChart);

    try {
      const ctx = this.topModelesChartRef.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('Failed to get 2D context for top modeles chart');
        return;
      }

      this.topModelesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            label: this.translate.instant('stats.usage') || 'Usage',
            data: data.length ? data : [0],
            backgroundColor: [
              'rgba(139, 92, 246, 0.8)',
              'rgba(99, 102, 241, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(124, 58, 237, 0.8)',
              'rgba(109, 40, 217, 0.8)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: this.translate.instant('stats.charts.templates') || 'Top Templates',
              font: { size: 16 },
              padding: { top: 10, bottom: 20 }
            },
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 16,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw as number;
                  return `${label}: ${value} ${this.translate.instant('stats.invoices') || 'invoices'}`;
                }
              }
            }
          },
          cutout: '60%',
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    } catch (err) {
      console.error('Error initializing top modeles chart:', err);
    }
  }

  private getChartOptions(titleKey: string, yAxisTitleKey: string, isLineChart = false): ChartOptions {
    const title = this.translate.instant(titleKey, { year: this.currentYear }) || titleKey;
    const yAxisTitle = this.translate.instant(yAxisTitleKey) || yAxisTitleKey;

    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 500 },
          padding: { top: 10, bottom: 20 },
          color: '#374151'
        },
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#f9fafb',
          bodyColor: '#f9fafb',
          padding: 12,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += context.parsed.y.toLocaleString(this.translate.currentLang || 'en');
                if (yAxisTitle.includes('Amount')) label += ' DT';
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle,
            color: '#6b7280',
            font: { size: 12, weight: 500 }
          },
          grid: { color: '#e5e7eb' },
          ticks: { color: '#6b7280' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#6b7280' }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    };

    if (isLineChart) {
      return {
        ...baseOptions,
        elements: { line: { borderWidth: 3 } }
      };
    }

    return baseOptions;
  }

  private destroyChart(chart?: Chart): void {
    if (chart) {
      chart.destroy();
    }
  }

  private destroyCharts(): void {
    this.destroyChart(this.revenueChart);
    this.destroyChart(this.topClientsChart);
    this.destroyChart(this.topServicesChart);
    this.destroyChart(this.topModelesChart);
  }
}