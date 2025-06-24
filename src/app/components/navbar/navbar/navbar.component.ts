import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

import { StorageService } from '../../../services/storage/storage.service';
import { CartService } from '../../../services/cartservice/cartservice.service';
import { CartComponent } from '../../cart/cartcomponent.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CartComponent], 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username: string = '';
  searchQuery: string = '';
  cartItemCount: number = 0;

  isNavHidden = false;
  private lastScrollPosition = 0;
  private scrollThreshold = 50;

  isMobileSearchVisible = false;
  isMenuOpen = false;
  isCategoriesHidden = false;
  
  private isBrowser: boolean;
  private storageEventListener: () => void;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.storageEventListener = () => this.checkLoginStatus();
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.subscribeToCartUpdates();
    this.subscribeToRouteChanges();

    if (this.isBrowser) {
      window.addEventListener('storage', this.storageEventListener);
      window.addEventListener('scroll', this.onWindowScroll, true);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('storage', this.storageEventListener);
      window.removeEventListener('scroll', this.onWindowScroll, true);
    }
  }

  private checkLoginStatus(): void {
    if (this.isBrowser) {
      const authToken = this.storageService.getItem('authToken');
      this.isLoggedIn = !!authToken;
      this.username = this.storageService.getItem('username') || 'Usuário';
    }
  }
  
  private subscribeToCartUpdates(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.length;
    });
  }

  private subscribeToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const routeData = this.router.routerState.snapshot.root.firstChild?.data;
      this.isCategoriesHidden = routeData?.['hideCategories'] || false;
      this.isMenuOpen = false;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMobileSearch(): void {
    this.isMobileSearchVisible = !this.isMobileSearchVisible;
  }

  logout(): void {
    this.storageService.clear(); // Limpa todo o storage local
    this.checkLoginStatus();
    this.router.navigate(['/home']);
  }
  
  logoutAndCloseMenu(): void {
    this.logout();
    this.toggleMenu();
  }

  openCart(): void {
    this.cartService.openCart();
  }

  executeSearch(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      if (this.isMobileSearchVisible) {
        this.toggleMobileSearch();
      }
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery.trim() },
      });
      this.searchQuery = '';
    }
  }

  // Removido o @HostListener para adicionar e remover o listener manualmente
  private onWindowScroll = (): void => {
    if (!this.isBrowser) return;

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > this.scrollThreshold) {
      this.isNavHidden = true;
    } else {
      this.isNavHidden = false;
    }
    
    this.lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
  }
}