import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { DashboardService } from '../../../dashboard-service/dashboard-services.service';

interface Categoria {
  nome: string;
  valor: number;
  cor: string;
}

interface MonthHighlights {
  total: number;
  categorias: Categoria[];
}

interface WeeklySale {
  dia: string;
  valor: number;
  cor: string;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('weeklySalesChart') weeklySalesChart!: ElementRef;
  @ViewChild('monthHighlightsChart') monthHighlightsChart!: ElementRef;

  weeklySales: WeeklySale[] = [];
  monthHighlights: MonthHighlights = { total: 0, categorias: [] };
  private weeklySalesChartInstance: Chart | null = null;
  private monthHighlightsChartInstance: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData('7d');
    this.loadMonthHighlights();
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  updateChartData(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const period = target.value;
    this.loadData(period);
  }

  loadData(period: string): void {
    const data: { [key: string]: WeeklySale[] } = {
      '24h': [
        { dia: '00h', valor: 5, cor: 'gray' },
        { dia: '01h', valor: 3, cor: 'gray' },
        { dia: '02h', valor: 3, cor: 'gray' },
        { dia: '03h', valor: 4, cor: 'gray' },
        { dia: '04h', valor: 5, cor: 'gray' },
        { dia: '05h', valor: 2, cor: 'gray' },
        { dia: '06h', valor: 3, cor: 'gray' },
        { dia: '07h', valor: 4, cor: 'gray' },
        { dia: '08h', valor: 6, cor: 'gray' },
        { dia: '09h', valor: 8, cor: 'gray' },
        { dia: '10h', valor: 8, cor: 'gray' },
        { dia: '11h', valor: 10, cor: 'gray' },
        { dia: '12h', valor: 14, cor: 'gray' },
        { dia: '13h', valor: 13, cor: 'gray' },
        { dia: '14h', valor: 12, cor: 'gray' },
        { dia: '15h', valor: 14, cor: 'gray' },
        { dia: '16h', valor: 15, cor: 'gray' },
        { dia: '17h', valor: 12, cor: 'gray' },
        { dia: '18h', valor: 12, cor: 'gray' },
        { dia: '19h', valor: 12, cor: 'gray' },
        { dia: '20h', valor: 14, cor: 'gray' },
        { dia: '21h', valor: 16, cor: 'gray' },
        { dia: '22h', valor: 11, cor: 'gray' },
        { dia: '23h', valor: 8, cor: 'gray' },
      ],
      '7d': [
        { dia: 'Dom', valor: 31, cor: 'red' },
        { dia: 'Seg', valor: 31, cor: 'blue' },
        { dia: 'Ter', valor: 25, cor: 'green' },
        { dia: 'Qua', valor: 23, cor: 'orange' },
        { dia: 'Qui', valor: 10, cor: 'purple' },
        { dia: 'Sex', valor: 21, cor: 'cyan' },
        { dia: 'Sáb', valor: 21, cor: 'yellow' },
      ],
      '1m': [
        { dia: 'Semana 1', valor: 200, cor: 'red' },
        { dia: 'Semana 2', valor: 300, cor: 'blue' },
        { dia: 'Semana 3', valor: 250, cor: 'green' },
        { dia: 'Semana 4', valor: 400, cor: 'orange' },
      ],
      '1y': [
        { dia: 'Jan', valor: 1000, cor: 'red' },
        { dia: 'Fev', valor: 1500, cor: 'blue' },
        { dia: 'Mar', valor: 1800, cor: 'green' },
        { dia: 'Abr', valor: 1300, cor: 'orange' },
        { dia: 'Mai', valor: 2000, cor: 'purple' },
        { dia: 'Jun', valor: 2200, cor: 'cyan' },
        { dia: 'Jul', valor: 2500, cor: 'yellow' },
        { dia: 'Ago', valor: 2400, cor: 'pink' },
        { dia: 'Set', valor: 2300, cor: 'brown' },
        { dia: 'Out', valor: 2100, cor: 'grey' },
        { dia: 'Nov', valor: 2600, cor: 'black' },
        { dia: 'Dez', valor: 2800, cor: 'lime' },
      ],
    };

    this.weeklySales = data[period] || [];
    this.createWeeklySalesChart();
  }

  loadMonthHighlights(): void {
    this.dashboardService.getMonthHighlights().subscribe((data) => {
      this.monthHighlights = data;
      this.createMonthHighlightsChart();
    });
  }

  createCharts(): void {
    setTimeout(() => {
      this.createWeeklySalesChart();
      this.createMonthHighlightsChart();
    }, 500);
  }

  createWeeklySalesChart(): void {
    if (!this.weeklySalesChart?.nativeElement) return;
    if (this.weeklySalesChartInstance) {
      this.weeklySalesChartInstance.destroy();
    }

    this.weeklySalesChartInstance = new Chart(
      this.weeklySalesChart.nativeElement,
      {
        type: 'bar',
        data: {
          labels: this.weeklySales.map((sale) => sale.dia),
          datasets: [
            {
              label: 'Vendas',
              data: this.weeklySales.map((sale) => sale.valor),
              backgroundColor: this.weeklySales.map((sale) => sale.cor),
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      }
    );
  }

  createMonthHighlightsChart(): void {
    if (!this.monthHighlightsChart?.nativeElement) return;
    if (this.monthHighlightsChartInstance) {
      this.monthHighlightsChartInstance.destroy();
    }

    this.monthHighlightsChartInstance = new Chart(
      this.monthHighlightsChart.nativeElement,
      {
        type: 'doughnut',
        data: {
          labels: this.monthHighlights.categorias.map((cat) => cat.nome),
          datasets: [
            {
              data: this.monthHighlights.categorias.map((cat) => cat.valor),
              backgroundColor: this.monthHighlights.categorias.map(
                (cat) => cat.cor
              ),
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              enabled: true,
            },
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 17,
                  weight: 'bold'
                },
                padding: 35,
              },
              maxWidth: 230,
              maxHeight: 150
            },
          },
        },
        plugins: [
          {
            id: 'centerTextPlugin',
            beforeDraw: (chart) => {
              const { width, height, ctx } = chart;
              ctx.restore();
              ctx.font = 'bold 14px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#000';
              ctx.fillText('Destaques do Mês', width / 2, height / 2 - 60);
              ctx.font = 'bold 30px Arial';
              ctx.fillText(
                `${this.monthHighlights.total}`,
                width / 2,
                height / 2 + -30
              );
              ctx.save();
            },
          },
        ],
      }
    );
  }
}
