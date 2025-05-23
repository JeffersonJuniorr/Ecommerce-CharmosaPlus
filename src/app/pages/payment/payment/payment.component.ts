import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../../services/cartservice/cartservice.service';
import { Subscription, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductService } from '../../../services/products/products.service';
import { CouponService } from '../../../services/coupons/coupon.service';

interface CartItem {
  id: number;
  productId: number;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
  imageUrl?: string;  
  fullImageUrl?: any;  
  productName?: string;
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  subtotal = 0;
  frete = 0;
  discount = 0;
  couponCode = '';
  couponError = '';
  cep = '';

  private subs = new Subscription();

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private couponService: CouponService
  ) {}

  ngOnInit() {
    // obter itens do carrinho + buscar imagens e nomes
    this.subs.add(
      this.cartService.loadCart().subscribe(cart => {
        const items: CartItem[] = cart.items || [];
        // para cada item, buscamos imagem e nome
        const tasks = items.map(i => {
          const img$ = i.imageUrl
            ? this.cartService.fetchProductImage(i.productId, Number(i.imageUrl.match(/\d+$/)))
                .pipe(
                  map(blob => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob))),
                  catchError(_ => of(null))
                )
            : of(null);

          return forkJoin({
            image: img$,
            product: this.productService.getProductById(i.productId)
              .pipe(map(p => p.name), catchError(_ => of(`Produto #${i.productId}`)))
          }).pipe(
            map(r => ({
              ...i,
              fullImageUrl: r.image,
              productName: r.product,
              totalPrice: i.unitPrice * i.quantity
            }))
          );
        });

        forkJoin(tasks).subscribe(filled => {
          this.cartItems = filled;
          this.calcSubtotal();
        });
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  calcSubtotal() {
    this.subtotal = this.cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  }

  // Controles de quantidade iguais ao do carrinho
  increase(item: CartItem) {
    if (item.quantity < item.availableStock) {
      this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe(() => {
        item.quantity++;
        item.totalPrice = item.unitPrice * item.quantity;
        this.calcSubtotal();
      });
    }
  }

  decrease(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe(() => {
        item.quantity--;
        item.totalPrice = item.unitPrice * item.quantity;
        this.calcSubtotal();
      });
    } else {
      this.remove(item);
    }
  }

  remove(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe(() => {
      this.cartItems = this.cartItems.filter(i => i.id !== item.id);
      this.calcSubtotal();
    });
  }

  calculateFrete() {
    const clean = this.cep.replace(/\D/g, '');
    if (!/^\d{8}$/.test(clean)) return alert('CEP inválido');
    this.http.get<{ state: string }>(`https://brasilapi.com.br/api/cep/v2/${clean}`)
      .pipe(catchError(_=> of(null)))
      .subscribe(res => {
        if (!res) return alert('Erro ao calcular frete');
        // tabela simples
        const zones:any = {
          Sudeste: { price: 15, days: 5 },
          Sul:     { price: 12, days: 4 },
          Centro_Oeste: { price: 20, days: 7 },
          Nordeste: { price: 25, days: 10 },
          Norte: { price: 30, days: 12 },
        };
        let zone = 'Sudeste';
        const uf = res.state;
        if (['PR','RS','SC'].includes(uf)) zone='Sul';
        else if (['DF','GO','MT','MS'].includes(uf)) zone='Centro_Oeste';
        else if (['AL','BA','CE','MA','PB','PE','PI','RN','SE'].includes(uf)) zone='Nordeste';
        else if (['AC','AP','AM','PA','RO','RR','TO'].includes(uf)) zone='Norte';

        this.frete = zones[zone].price;
      });
  }

  applyCoupon() {
    this.couponError = '';
    if (!this.couponCode.trim()) {
      this.couponError = 'Informe um código de cupom.';
      return;
    }

    this.couponService.applyCoupon(this.couponCode.trim()).subscribe({
      next: (res: any) => {
        this.discount = res.discountAmount ?? 0;
        // opcional: se quiser usar o total vindo do backend:
        // this.subtotal = res.subtotalAmount;
      },
      error: err => {
        console.error('Erro ao aplicar cupom:', err);
        this.couponError = err.error?.message || 'Cupom inválido ou expirado.';
        this.discount = 0;
      }
    });
  }

  get total(): number {
    return this.subtotal + this.frete - this.discount;
  }
}
