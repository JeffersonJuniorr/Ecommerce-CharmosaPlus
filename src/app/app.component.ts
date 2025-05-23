import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer/footer.component';
import { SlidebarComponent } from './admin/slidebar/slidebar.component';
import { StorageService } from './services/storage/storage.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    SlidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'CharmosaPlus';
  isAdmin: boolean = false;
  isSidebarCollapsed: boolean = false;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit() {
    const userRole = this.storageService.getItem('userRole');
    this.isAdmin = userRole === 'ADMIN';
  }

  isAuthRoute(): boolean {
    return this.router.url === '/login' 
    || this.router.url === '/register' 
    || this.router.url === '/products-management' 
    || this.router.url === "/admin-extract"
    || this.router.url === "/admin-coupons"
    || this.router.url === "/admin-dashboard"
    || this.router.url === "/list-products"
    || this.router.url === "/payment"
    ;
  }
}
