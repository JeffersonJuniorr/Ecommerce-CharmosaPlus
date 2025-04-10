import { Component, ChangeDetectorRef, OnDestroy, PLATFORM_ID, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StorageService } from '../../../services/storage/storage.service';
import { CartService } from '../../../services/cartservice/cartservice.service';
import { CartComponent } from '../../cart/cartcomponent.component';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, CartComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild(CartComponent) cartComponent!: CartComponent;
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private cartService: CartService
  ) {
    // const userRole = this.storageService.getItem('userRole');
    // const authToken = this.storageService.getItem('authToken');
    // if (authToken) {
    //   this.isLoggedIn = true;
    //   this.isAdmin = userRole === 'admin';
    // }
  }

  cartItemCount: number = 0;

  ngOnDestroy(): void {
    // Perform any necessary cleanup here
    console.log('NavbarComponent is being destroyed');
  }

  ngOnInit() {
    const userRole = this.storageService.getItem('userRole');
    const authToken = this.storageService.getItem('authToken');
    if (authToken) {
      this.isLoggedIn = true;
      this.isAdmin = userRole === 'admin';
    }
  }

  logout() {
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userRole');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/home']);
  }

  openCart() {
    this.cartService.openCart();
  }
}