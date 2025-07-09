// Em src/app/components/dashboard-chart/dashboard-chart.component.ts

import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { ChartOptions, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule],
  template: '<canvas #chartCanvas></canvas>',
  styles: [':host { display: block; position: relative; height: 100%; width: 99%; }']
})
export class DashboardChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() chartType: 'bar' | 'doughnut' | 'line' = 'bar';
  @Input() chartData!: ChartData;
  @Input() chartOptions?: ChartOptions;

  private chartInstance: Chart | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Se os dados ou opções mudarem depois do gráfico criado, ele se atualiza sozinho
    if (this.chartInstance && (changes['chartData'] || changes['chartOptions'])) {
      this.updateChart();
    }
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    // Destrói a instância do gráfico para evitar vazamentos de memória
    this.chartInstance?.destroy();
  }

  private updateChart(): void {
    if (!this.chartInstance) return;
    this.chartInstance.data = this.chartData;
    this.chartInstance.options = this.chartOptions || {};
    this.chartInstance.update();
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement || !this.chartData) return;
    this.chartInstance?.destroy(); // Garante que não haja gráficos duplicados

    this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
      type: this.chartType,
      data: this.chartData,
      options: this.chartOptions || {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }
}