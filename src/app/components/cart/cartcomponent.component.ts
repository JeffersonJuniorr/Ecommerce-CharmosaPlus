import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CartService } from '../../services/cartservice/cartservice.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductService } from '../../services/products/products.service';

@Component({
  standalone: true,
  selector: 'app-cartcomponent',
  imports: [CommonModule],
  templateUrl: './cartcomponent.component.html',
  styleUrl: './cartcomponent.component.css',
})
export class CartComponent implements OnDestroy {
  public showCartModal = false;
  private cartSubscription!: Subscription;
  private cartOpenSubscription: Subscription;
  cartItems: any[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private productService: ProductService
  ) {
    this.cartOpenSubscription = this.cartService.isCartOpen$.subscribe(
      (isOpen) => {
        this.showCartModal = isOpen;
        if (isOpen) {
          this.loadCart();
        }
      }
    );

    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.cartOpenSubscription.unsubscribe();
  }

  loadCart() {
    this.cartService.loadCart().subscribe((cart) => {
      this.cartItems = cart.items || [];

      this.cartItems.forEach((item) => {
        if (item.imageUrl) {
          const [productId, imageId] = item.imageUrl.match(/\d+/g) || [];

          this.cartService.fetchProductImage(+productId, +imageId).subscribe({
            next: (blob) => {
              const objectUrl = URL.createObjectURL(blob);
              item.fullImageUrl = this.sanitizer.bypassSecurityTrustUrl(
                objectUrl
              ) as string;
              item.availableStock = item.availableStock ?? item.stockQuantity;
            },
            error: () => {
              item.fullImageUrl = null;
            },
          });
        }
      });

      // obter os nomes dos produtos via id
      this.productService
        .getProducts()
        .pipe(
          map((products) => {
            const nameById = new Map<number, string>();
            products.forEach((p) => nameById.set(p.id, p.name));
            return nameById;
          })
        )
        .subscribe((nameById) => {
          // enriquecer cada item
          this.cartItems.forEach((item) => {
            item.productName =
              nameById.get(item.productId) ?? `Produto #${item.productId}`;
          });
        });

      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    // Usar totalPrice fornecido pela API ou calcular caso não exista
    if (this.cartItems.length > 0 && this.cartItems[0].totalPrice) {
      this.total = this.cartItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    } else {
      this.total = this.cartItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
    }
  }

  public openCart(): void {
    this.showCartModal = true;
    this.loadCart();
    document.body.style.overflow = 'hidden';
  }

  public closeCart(): void {
    this.showCartModal = false;
    document.body.style.overflow = '';
  }

  increaseQuantity(item: any): void {
    if (item.quantity < item.availableStock) {
      this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe(
        () => this.loadCart(),
        (error) => console.error('Erro ao aumentar quantidade:', error)
      );
    }
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe(
        () => this.loadCart(),
        (error) => console.error('Erro ao diminuir quantidade:', error)
      );
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: any): void {
    this.cartService.removeItem(item.id).subscribe(
      () => this.loadCart(),
      (error) => console.error('Erro ao remover item:', error)
    );
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(
      () => this.loadCart(),
      (error) => console.error('Erro ao limpar carrinho:', error)
    );
  }

  goToCheckout() {
    this.closeCart();
    this.router.navigate(['/payment']);
  }
}
