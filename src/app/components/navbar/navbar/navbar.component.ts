import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { StorageService } from '../../../services/storage/storage.service';
import { CartService } from '../../../services/cartservice/cartservice.service';
import { CartComponent } from '../../cart/cartcomponent.component';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, CartComponent, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild(CartComponent) cartComponent!: CartComponent;
  isLoggedIn = false;
  isAdmin = false;
  username: string = '';
  searchQuery: string = '';

  isNavHidden = false;
  lastScrollPosition = 0;
  scrollThreshold = 50;

  // Adicionado para controle de SSR
  private isBrowser: boolean = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private cartService: CartService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  cartItemCount: number = 0;

  ngOnDestroy(): void {
    if (this.isBrowser) {
      // Remove o listener apenas se estiver no browser
      window.removeEventListener('storage', this.storageEventListener);
    }
    // console.log('NavbarComponent is being destroyed');
  }

  // Armazena a referência da função para poder remover o listener depois
  private storageEventListener = () => this.checkLoginStatus();

  ngOnInit() {
    this.checkLoginStatus();

    this.cartService.cartItems$.subscribe((items) => {
      this.cartItemCount = items.length;
    });

    // Verifique novamente o status de autenticação quando o armazenamento for alterado (para outras guias/janelas)
    if (this.isBrowser) {
      window.addEventListener('storage', this.storageEventListener);
    }
  }

  checkLoginStatus() {
    const userRole = this.storageService.getItem('userRole');
    const authToken = this.storageService.getItem('authToken');
    const storedUsername = this.storageService.getItem('username');

    console.log('userRole:', userRole);
    console.log('authToken:', authToken);
    console.log('storedUsername:', storedUsername);

    this.isLoggedIn = !!authToken;
    this.isAdmin = userRole === 'admin';
    this.username = storedUsername || 'Usuário';
  }

  logout() {
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userRole');
    this.storageService.removeItem('username');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/home']);
  }

  openCart() {
    this.cartService.openCart();
  }

  search() {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery },
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return; // Não executa no servidor
    
    const currentScrollPosition = window.pageYOffset || 
                                this.document.documentElement.scrollTop || 
                                this.document.body.scrollTop || 0;
    
    if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > this.scrollThreshold) {
      this.isNavHidden = true;
    } else if (currentScrollPosition < this.lastScrollPosition) {
      this.isNavHidden = false;
    }
    
    this.lastScrollPosition = currentScrollPosition;
  }
}
