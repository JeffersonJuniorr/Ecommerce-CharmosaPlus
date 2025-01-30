import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard-service/dashboard-services.service';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from '../../services/dashboard/charts/charts/charts.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, ChartsComponent],
})
export class AdminDashboardComponent implements OnInit {
  orderSummary: any;
  weeklySales: any[] = [];
  monthHighlights: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getOrderSummary().subscribe(data => {
      this.orderSummary = data;
    });

    this.dashboardService.getWeeklySales().subscribe(data => {
      this.weeklySales = data;
    });

    this.dashboardService.getMonthHighlights().subscribe(data => {
      this.monthHighlights = data;
    });
  }
}
