import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id:           number;
  productId:    number;
  selectedColor: string;
  selectedSize:  string;
  quantity:      number;
  unitPrice:     number;
  totalPrice:    number;
  availableStock: number;
  imageUrl:      string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  // Método para obter a URL base da API (para uso com imagens)
  getApiBaseUrl(): string {
    return environment.apiUrl;
  }
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
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
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

   // retorna o blob da imagem, já com o header de auth incluso
   public fetchProductImage(
    productId: number,
    imageId: number
  ): Observable<Blob> {
    const url = `${this.getApiBaseUrl()}/products/${productId}/images/${imageId}`;
    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  private loadInitialCart(): void {
    const token = this.storageService.getItem('authToken');

    if (token) {
      // Usuário autenticado - carrega do backend
      this.loadCart().subscribe({
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

  // Método público para carregar o carrinho
  loadCart(): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      return this.http.get<any>(this.apiUrl, {
        headers: this.getAuthHeaders()
      }).pipe(
        tap(response => {
          this.cartItemsSubject.next(response.items || []);
          this.totalSubject.next(this.calculateTotalAmount(response.items || []));
        }),
        catchError(error => {
          console.error('Erro ao carregar carrinho:', error);
          this.loadLocalCart();
          const localCart = this.storageService.getItem('tempCart') || { items: [] };
          return of(localCart);
        })
      );
    } else {
      const localCart = this.storageService.getItem('tempCart') || { items: [] };
      this.cartItemsSubject.next(localCart.items);
      return of(localCart);
    }
  }

  private calculateTotalAmount(items: any[]): number {
    return items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }

  private updateLocalCart(cart: any) {
    this.cartItemsSubject.next(cart.items || []);
    this.totalSubject.next(cart.totalAmount || 0);
    this.storageService.setItem('tempCart', {
      items: cart.items,
      total: cart.totalAmount,
    });
  }

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
    quantity: item.quantity || 1
  };

  const token = this.storageService.getItem('authToken');

  if (token) {
    // Usuário autenticado – envia para o backend
    return this.http.post<any>(`${this.apiUrl}/add`, cartItem, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => {
        this.cartItemsSubject.next(response.items || []);
        this.totalSubject.next(this.calculateTotalAmount(response.items || []));
      }),
      catchError(error => {
        console.error('Erro ao adicionar ao carrinho:', error);
        let errorMessage = 'Erro ao adicionar produto ao carrinho';

        if (error.status === 500 && error.error?.message?.includes('Quantidade insuficiente')) {
          errorMessage = 'Quantidade em estoque insuficiente';
        } else if (error.status === 500 && error.error?.message?.includes('Produto esgotado')) {
          errorMessage = 'Produto esgotado no momento';
        }

        return of({ error: true, message: errorMessage });
      })
    );
  } else {
    // Usuário não autenticado – manipula localmente
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(
      (i) =>
        i.productId === cartItem.productId &&
        i.selectedColor === cartItem.selectedColor &&
        i.selectedSize === cartItem.selectedSize
    );

    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    } else {
      currentItems.push({
        ...cartItem,
        id: Date.now(), // ID temporário
        // name: item.name,
        unitPrice: item.price,
        imageUrl: item.image,
        availableStock: item.availableStock || 10,
        totalPrice: item.price * (item.quantity || 1)
      });
    }

    this.cartItemsSubject.next(currentItems);
    this.totalSubject.next(this.calculateTotalAmount(currentItems));
    this.saveLocalCart(currentItems);

    return of({ items: currentItems });
  }
}

  removeItem(itemId: number): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      return this.http.delete(`${this.apiUrl}/remove/${itemId}`, {
        headers: this.getAuthHeaders(),
      }).pipe(
        tap((response: any) => {
          this.cartItemsSubject.next(response || []);
          // this.cartItemsSubject.next(response.items || []);
        }),
        catchError(error => {
          console.error('Erro ao remover item:', error);
          // Tentar remover localmente em caso de erro
          const updatedItems = this.cartItemsSubject.value.filter(
            (item) => item.id !== itemId
          );
          this.cartItemsSubject.next(updatedItems);
          return of({ items: updatedItems });
        })
      );
    } else {
      const updatedItems = this.cartItemsSubject.value.filter(
        (item) => item.id !== itemId
      );
      this.cartItemsSubject.next(updatedItems);
      this.saveLocalCart(updatedItems);
      return of({ items: updatedItems });
    }
  }

  clearCart(): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      return this.http.delete(`${this.apiUrl}/clear`, { 
        headers: this.getAuthHeaders() 
      }).pipe(
        tap((response) => {
          this.cartItemsSubject.next([]);
        }),
        catchError(error => {
          console.error('Erro ao limpar carrinho:', error);
          this.cartItemsSubject.next([]);
          return of({ items: [] });
        })
      );
    } else {
      this.cartItemsSubject.next([]);
      this.storageService.removeItem('tempCart');
      return of({ items: [] });
    }
  }

  updateQuantity(itemId: number, newQuantity: number): Observable<any> {
    const token = this.storageService.getItem('authToken');

    if (token) {
      // Adaptando para a URL do exemplo: /cart/update-quantity
      return this.http.put(
        `${this.apiUrl}/update-quantity`, 
        { itemId, quantity: newQuantity },
        { headers: this.getAuthHeaders() }
      ).pipe(
        tap((response: any) => {
          this.cartItemsSubject.next(response.items || []);
        }),
        catchError(error => {
          console.error('Erro ao atualizar quantidade:', error);
          
          // Atualiza a UI em caso de erro
          const updatedItems = this.cartItemsSubject.value.map((item) => {
            if (item.id === itemId) {
              return { 
                ...item, 
                quantity: newQuantity,
                totalPrice: item.unitPrice * newQuantity 
              };
            }
            return item;
          });
          this.cartItemsSubject.next(updatedItems);
          return of({ items: updatedItems });
        })
      );
    } else {
      const updatedItems = this.cartItemsSubject.value.map((item) => {
        if (item.id === itemId) {
          return { 
            ...item, 
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity 
          };
        }
        return item;
      });
      this.cartItemsSubject.next(updatedItems);
      this.saveLocalCart(updatedItems);
      return of({ items: updatedItems });
    }
  }

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