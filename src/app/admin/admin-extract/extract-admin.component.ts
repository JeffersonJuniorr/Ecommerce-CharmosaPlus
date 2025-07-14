import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { MOCK_EXTRACT_DATA } from '../../services/extract/mock-extract.service';
import { DashboardChartComponent } from '../../components/dashboard-chart/dashboard-chart.component'; 

@Component({
  standalone: true,
  selector: 'app-extract-admin',
  templateUrl: './extract-admin.component.html',
  styleUrls: ['./extract-admin.component.css'],
  imports: [CommonModule, CurrencyPipe, DatePipe, DashboardChartComponent],
})
export class ExtractAdminComponent implements OnInit {
  
  summary = MOCK_EXTRACT_DATA.summary;
  transactions = MOCK_EXTRACT_DATA.transactions;

  cashFlowChartData!: ChartData;
  cashFlowChartOptions!: ChartOptions;

  constructor() {}

  ngOnInit(): void {
    this.prepareCashFlowChart();
  }

  prepareCashFlowChart(): void {
    const data = MOCK_EXTRACT_DATA.cashFlow;

    this.cashFlowChartData = {
      labels: data.labels,
      datasets: [
        {
          label: 'Receita',
          data: data.revenue,
          backgroundColor: 'rgba(40, 167, 69, 0.7)',
          borderColor: '#28a745',
          borderRadius: 4,
        },
        {
          label: 'Despesas',
          data: data.expenses,
          backgroundColor: 'rgba(229, 62, 62, 0.7)',
          borderColor: '#e53e3e',
          borderRadius: 4,
        }
      ]
    };

    this.cashFlowChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { stacked: true, grid: { color: '#f0f0f0' } },
        x: { stacked: true, grid: { display: false } }
      }
    };
  }
}