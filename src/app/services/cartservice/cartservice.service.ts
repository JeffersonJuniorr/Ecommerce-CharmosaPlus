import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private totalSubject = new BehaviorSubject<number>(0);
  total$ = this.totalSubject.asObservable();

  private isCartOpenSubject = new BehaviorSubject<boolean>(false);
  isCartOpen$ = this.isCartOpenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.loadInitialCart();
    // this.loadCart();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  private loadInitialCart(): void {
    const token = this.storageService.getItem('authToken');

    if (token) {
      // Usuário autenticado - carrega do backend
      this.http
        .get<any>(this.apiUrl, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            this.cartItemsSubject.next(response.items || []);
          },
          error: (err) => {
            console.error('Erro ao carregar carrinho:', err);
            this.loadLocalCart();
          },
        });
    } else {
      // Usuário não autenticado - carrega do localStorage
      this.loadLocalCart();
    }
  }

  private loadLocalCart(): void {
    const savedCart = this.storageService.getItem('tempCart');
    if (savedCart) {
      this.cartItemsSubject.next(savedCart.items || []);
    }
  }

  private saveLocalCart(items: any[]): void {
    this.storageService.setItem('tempCart', { items });
  }

  private loadCart(): void {
    // tem que ter autenticação, porque pode causar erros se o endpoint exigir autenticação
    const token = this.storageService.getItem('authToken');

    if (!token) {
      return; // Não faz requisição se não estiver autenticado
    }

    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        if (response && response.items) { // Verifica se a resposta tem a estrutura esperada (talvez apagar isso)
          this.cartItemsSubject.next(response.items);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar carrinho:', err);
        this.loadLocalCart();
      },
    });
  }

  private updateLocalCart(cart: any) {
    this.cartItemsSubject.next(cart.items || []);
    this.totalSubject.next(cart.totalAmount || 0);
    this.storageService.setItem('tempCart', {
      items: cart.items,
      total: cart.totalAmount,
    });
  }

  openCartRequested = new BehaviorSubject<boolean>(false);

  openCart() {
    this.isCartOpenSubject.next(true);
  }

  closeCart() {
    this.isCartOpenSubject.next(false);
  }

  addToCart(item: any): Observable<any> {
    const cartItem = {
      productId: item.id,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      quantity: item.quantity || 1 // Garante quantidade mínima
    };
  
    const token = this.storageService.getItem('authToken');
  
    if (token) {
      return this.http.post<any>(`${this.apiUrl}/add`, cartItem, {
        headers: this.getAuthHeaders()
      }).pipe(
        tap((response) => {
          this.cartItemsSubject.next(response.items);
        }),
        catchError(error => {
          console.error('Erro ao adicionar ao carrinho:', error);
          let errorMessage = 'Erro ao adicionar produto ao carrinho';
          
          if (error.status === 500 && error.error?.message?.includes('Quantidade insuficiente')) {
            errorMessage = 'Quantidade em estoque insuficiente';
          } else if (error.status === 500 && error.error?.message?.includes('Produto esgotado')) {
            errorMessage = 'Produto esgotado no momento';
          }
          
          throw new Error(errorMessage);
        })
      );
    } else {
      // Usuário não autenticado - salva no localStorage
      const currentItems = this.cartItemsSubject.value;
      const existingItem = currentItems.find(
        (i) =>
          i.productId === cartItem.productId &&
          i.selectedColor === cartItem.selectedColor &&
          i.selectedSize === cartItem.selectedSize
      );

      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        currentItems.push({
          ...cartItem,
          name: item.name,
          price: item.price,
          image: item.image,
        });
      }

      this.cartItemsSubject.next(currentItems);
      this.saveLocalCart(currentItems);
      return of(null);
    }
  }

  removeItem(itemId: number): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      return this.http
        .delete(`${this.apiUrl}/remove/${itemId}`, {
          headers: this.getAuthHeaders(),
        })
        .pipe(
          tap(() => {
            const updatedItems = this.cartItemsSubject.value.filter(
              (item) => item.id !== itemId
            );
            this.cartItemsSubject.next(updatedItems);
          })
        );
    } else {
      const updatedItems = this.cartItemsSubject.value.filter(
        (item) => item.id !== itemId
      );
      this.cartItemsSubject.next(updatedItems);
      this.saveLocalCart(updatedItems);
      return of(null);
    }
  }

  clearCart(): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      return this.http
        .delete(`${this.apiUrl}/clear`, { headers: this.getAuthHeaders() })
        .pipe(
          tap(() => {
            this.cartItemsSubject.next([]);
          })
        );
    } else {
      this.cartItemsSubject.next([]);
      this.storageService.removeItem('tempCart');
      return of(null);
    }
  }

  updateQuantity(itemId: number, newQuantity: number): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      return this.http
        .patch(
          `${this.apiUrl}/update/${itemId}`,
          { quantity: newQuantity },
          { headers: this.getAuthHeaders() }
        )
        .pipe(
          tap(() => {
            const updatedItems = this.cartItemsSubject.value.map((item) => {
              if (item.id === itemId) {
                return { ...item, quantity: newQuantity };
              }
              return item;
            });
            this.cartItemsSubject.next(updatedItems);
          })
        );
    } else {
      const updatedItems = this.cartItemsSubject.value.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      this.cartItemsSubject.next(updatedItems);
      this.saveLocalCart(updatedItems);
      return of(null);
    }
  }

  // private calculateTotal(items: any[]): number {
  //   return items.reduce(
  //     (total, item) => total + item.unitPrice * item.quantity,
  //     0
  //   );
  // }

  syncLocalCartWithBackend(token: string): Observable<any> {
    const localCart = this.storageService.getItem('tempCart');
    if (!localCart?.items?.length) return of(null);

    return this.http
      .post(`${this.apiUrl}/sync`, localCart.items, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        tap((response: any) => {
          this.cartItemsSubject.next(response.items || []);
          this.storageService.removeItem('tempCart');
        })
      );
  }
}