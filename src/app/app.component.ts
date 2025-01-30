import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar/navbar.component'
import { FooterComponent } from "./components/footer/footer/footer.component"
import { SlidebarComponent } from './admin/slidebar/slidebar.component'
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ChartsComponent } from './services/dashboard/charts/charts/charts.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    SlidebarComponent,
    ChartsComponent,
    // AdminDashboardComponent,
  ],
  template: `<app-admin-dashboard></app-admin-dashboard>`,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CharmosaPlus';
}
