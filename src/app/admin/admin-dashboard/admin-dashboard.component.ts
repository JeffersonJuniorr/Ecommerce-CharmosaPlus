import { Component, OnInit } from '@angular/core';
import { MOCK_DASHBOARD_DATA } from '../../services/dashboard-service/mock-dashboard.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';

import { DashboardChartComponent } from '../../components/dashboard-chart/dashboard-chart.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, CurrencyPipe, DatePipe, DashboardChartComponent],
})
export class AdminDashboardComponent implements OnInit {
  orderSummary = MOCK_DASHBOARD_DATA.orderSummary;
  recentActivities = MOCK_DASHBOARD_DATA.recentActivities;
  recentPurchases = MOCK_DASHBOARD_DATA.recentPurchases;

  salesLabels: string[] = [];
  salesData: number[] = [];
  
  highlightsLabels: string[] = [];
  highlightsData: number[] = [];
  highlightsColors: string[] = [];

  salesChartData!: ChartData;
  salesChartOptions!: ChartOptions;

  highlightsChartData!: ChartData;
  highlightsChartOptions!: ChartOptions;

  constructor() {}

  ngOnInit(): void {
    this.orderSummary = MOCK_DASHBOARD_DATA.orderSummary;
    this.recentActivities = MOCK_DASHBOARD_DATA.recentActivities;
    this.recentPurchases = MOCK_DASHBOARD_DATA.recentPurchases;

    this.prepareSalesData('7d');
    this.prepareHighlightsData();
  }

  prepareSalesData(period: '7d' | '1m'): void {
  const data = period === '7d' 
    ? [{d:'Seg', v:120}, {d:'Ter', v:180}, {d:'Qua', v:150}, {d:'Qui', v:210}, {d:'Sex', v:250}, {d:'Sáb', v:190}, {d:'Dom', v:230}]
    : [{d:'S1', v:800}, {d:'S2', v:950}, {d:'S3', v:700}, {d:'S4', v:1100}];
  
  this.salesChartData = {
    labels: data.map(d => d.d),
    datasets: [{
      label: 'Vendas',
      data: data.map(d => d.v),
      fill: true,
      backgroundColor: 'rgba(239, 191, 4, 0.2)',
      borderColor: '#EFBF04',
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#EFBF04',
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#EFBF04',
    }]
  };

    this.salesChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } }
    };
  }

   prepareHighlightsData(): void {
  const highlights = MOCK_DASHBOARD_DATA.recentPurchases.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});

  this.highlightsChartData = {
    labels: Object.keys(highlights),
    datasets: [{
      data: Object.values(highlights),
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(23, 162, 184, 0.8)', 
        'rgba(108, 117, 125, 0.8)'
      ],
      borderWidth: 0,
    }]
  };
  this.highlightsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { padding: 20 } } }
  };
}

  onSalesPeriodChange(event: Event): void {
    const period = (event.target as HTMLSelectElement).value as '7d' | '1m';
    this.prepareSalesData(period);
  }
}

