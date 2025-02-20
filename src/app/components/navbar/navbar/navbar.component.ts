import { Component, ChangeDetectorRef, OnDestroy, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StorageService } from '../../../services/storage/storage.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  showCartModal: boolean = false;
  cartProducts: any[] = [];
  isBrowser: boolean = false;
  total = 0;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      const userRole = localStorage.getItem('userRole');
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        this.isLoggedIn = true;
        this.isAdmin = userRole === 'admin';
      }
      
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      this.loadCart();
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'cart') {
      this.loadCart();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isBrowser) {
      const navLinks = document.querySelector('.navbar-links') as HTMLElement;
      if (this.isMenuOpen) {
        navLinks.classList.add('active');
      } else {
        navLinks.classList.remove('active');
      }
    }
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.router.navigate(['/home']);
    }
  }

  openCartModal() {
    this.loadCart();
    this.showCartModal = true;
  }

  closeCartModal() {
    this.showCartModal = false;
  }

  goToCart() {
    this.closeCartModal();
    this.router.navigate(['/cart']);
  }

  loadCart() {
    const savedCart = this.storageService.getItem('cart');
    if (savedCart) {
      this.cartProducts = JSON.parse(JSON.stringify(savedCart));
      this.calculateTotal();
    } else {
      this.cartProducts = [];
      this.total = 0;
    }
  }

  saveCart() {
    this.storageService.setItem('cart', this.cartProducts);
    if (this.isBrowser) {
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  calculateTotal() {
    this.total = this.cartProducts.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }

  addToCart(newItem: any) {
    const sizeNew = newItem.selectedSize || '';
    const colorNew = newItem.selectedColor || '';
    const existingItem = this.cartProducts.find(
      (item) =>
        item.id === newItem.id &&
        (item.selectedSize || '') === sizeNew &&
        (item.selectedColor || '') === colorNew
    );
  
    if (existingItem) {
      existingItem.quantity += newItem.quantity;
    } else {
      this.cartProducts.push({ ...newItem });
    }
  
    this.calculateTotal();
    this.saveCart();
    this.cd.markForCheck();
  }

  increaseQuantity(item: any) {
    const index = this.cartProducts.findIndex(i => 
      i.id === item.id && 
      i.selectedSize === item.selectedSize && 
      i.selectedColor === item.selectedColor
    );
    
    if (index !== -1) {
      this.cartProducts[index].quantity++;
      this.calculateTotal();
      this.saveCart();
      this.cd.markForCheck();
    }
  }
  
  decreaseQuantity(item: any) {
    const index = this.cartProducts.findIndex(i => 
      i.id === item.id && 
      i.selectedSize === item.selectedSize && 
      i.selectedColor === item.selectedColor
    );
    
    if (index !== -1) {
      if (this.cartProducts[index].quantity > 1) {
        this.cartProducts[index].quantity--;
      } else {
        this.cartProducts.splice(index, 1);
      }
      this.calculateTotal();
      this.saveCart();
      this.cd.markForCheck();
    }
  }

  removeItem(item: any) {
    const index = this.cartProducts.findIndex(i => 
      i.id === item.id && 
      i.selectedSize === item.selectedSize && 
      i.selectedColor === item.selectedColor
    );
    
    if (index !== -1) {
      if (this.cartProducts[index].quantity > 1) {
        this.cartProducts[index].quantity--;
      } else {
        this.cartProducts.splice(index, 1);
      }
      this.calculateTotal();
      this.saveCart();
      this.cd.markForCheck();
    }
  }

  clearCart() {
    this.cartProducts = [];
    this.calculateTotal();
    this.storageService.removeItem('cart');
    this.cd.markForCheck();
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
  }
}