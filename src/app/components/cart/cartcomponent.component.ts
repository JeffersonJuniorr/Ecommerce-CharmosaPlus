import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cartservice/cartservice.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-cartcomponent',
  imports: [CommonModule],
  templateUrl: './cartcomponent.component.html',
  styleUrl: './cartcomponent.component.css'
})
export class CartComponent implements OnDestroy{
  public showCartModal = false;
  private cartSubscription!: Subscription;
  private cartOpenSubscription: Subscription;
  cartItems: any[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    this.cartOpenSubscription = this.cartService.isCartOpen$.subscribe(isOpen => {
      this.showCartModal = isOpen;
    });

    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  private subscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.cartOpenSubscription.unsubscribe();
  }

  loadCart() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }


  // ngOnInit() {
  //   this.cartService.cartItems$.subscribe(items => {
  //     this.cartItems = items;
  //   });

  //   this.cartService.total$.subscribe(total => {
  //     this.total = total;
  //   });
  // }

  public openCart(): void {
    this.showCartModal = true;
    this.loadCart();
  }

  public closeCart(): void {
    this.showCartModal = false;
  }
  

  // goToCart() {
  //   this.closeCart();
  //   this.router.navigate(['/cart']);
  // }

  increaseQuantity(item: any): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe();
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe();
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: any): void {
    this.cartService.removeItem(item.id).subscribe();
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  goToCheckout() {
    this.closeCart();
    this.router.navigate(['/checkout']);
  }
}
