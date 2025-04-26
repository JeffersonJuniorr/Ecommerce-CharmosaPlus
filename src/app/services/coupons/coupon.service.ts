import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage/storage.service';

export interface Coupon {
  id?: number;
  code: string;
  description?: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minimumAmountToApply?: number;
  individualUseOnly: boolean;
  freeShipping: boolean;
  maxUses?: number;
  timesUsed?: number;
  productId?: number | null;
  expirationDate?: string;
 
  // maximumAmount?: number;
  // excludeSaleItems: boolean;
  // productIds?: number[];
  // excludedProductIds?: number[];
  // usageCount?: number;
  // emailRestrictions?: string[];
  
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private couponCreated = new Subject<void>();

  couponCreated$ = this.couponCreated.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/coupons`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar cupons:', error);
        return of([]);
      })
    );
  }

  createCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/coupon`, coupon, { 
      headers: this.getHeaders() 
    });
  }

  applyCoupon(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply-coupon/${code}`, {}, { 
      headers: this.getHeaders() 
    });
  }

  deleteCoupon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/coupon/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Gerar código de cupom aleatório
  generateCouponCode(): Observable<{ code: string }> {
    // Implementação local - pode ser substituída por um endpoint se disponível
    const randomCode = 'CHARMOSA' + Math.floor(10 + Math.random() * 100);
    return of({ code: randomCode });
  }
}