import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SafeUrl } from '@angular/platform-browser';
import { StorageService } from '../../services/storage/storage.service';
import { map } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  colors: string[];
  sizes: string[];
  images?: File[];
  imageUrls?: (string | SafeUrl)[];
  category?: string;
  isNew?: boolean;
  active?: boolean;
  quantity?: number;
  thumbnailUrl?: string | SafeUrl;
  selected?: boolean;
  // discount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient, private storageService: StorageService) {}

  // Método auxiliar para obter headers com token
  private getHeaders(): HttpHeaders {
    const token = this.storageService.getItem('authToken'); // Pegando o token do localStorage
    if (!token) {
      console.error('Token não encontrado! O usuário pode precisar se autenticar novamente.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() });
  // }

  getProducts(): Observable<Product[]> {
  return this.http
    .get<Product[]>(this.apiUrl, { headers: this.getHeaders() })
    .pipe(
      map(products =>
        products.map(p => ({
          ...p,
          // garante que cada cor já venha com '#'
          colors: (p.colors || []).map(c =>
            c.startsWith('#') ? c : `#${c}`
          ),
          sizes: p.sizes || [],
        }))
      )
    );
}

  // // checkout
  // getProductById(productId: number): Observable<Product> {
  //   return this.http.get<Product>(`${this.apiUrl}/${productId}`, { headers: this.getHeaders() });
  // }

  getProductById(id: number): Observable<Product> {
  return this.http
    .get<Product>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
    .pipe(
      map(p => ({
        ...p,
        colors: (p.colors || []).map(c =>
          c.startsWith('#') ? c : `#${c}`
        ),
        sizes: p.sizes || [],
      }))
    );
}

// novo método para buscar *todas* as imagens em base64
getProductImagesBase64(productId: number): Observable<string[]> {
  const url = `${this.apiUrl}/${productId}/images`;
  return this.http.get<string[]>(url, { headers: this.getHeaders() });
}

  // getProductImage(productId: number, imageId: number = 1): Observable<Blob> {
  //   return this.http.get(`${this.apiUrl}/${productId}/images?imageId=${imageId}`, {
  //     headers: this.getHeaders(),
  //     responseType: 'blob'
  //   })
  //   // .pipe(
  //   //   catchError(error => {
  //   //     console.error(`Error loading image for product ${productId}, image ${imageId}:`, error);
  //   //     return throwError(() => error);
  //   //   })
  //   // );
  // }

  addProduct(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateProduct(id: number, updateData: FormData | Partial<Product>): Observable<any> {
    const headers = this.getHeaders();
  
    // Se for FormData, não defina o Content-Type (o navegador fará isso automaticamente)
    if (updateData instanceof FormData) {
      return this.http.put(`${this.apiUrl}/${id}`, updateData, { headers: headers.delete('Content-Type') });
    } else {
      // Caso contrário, envie como JSON
      return this.http.put(`${this.apiUrl}/${id}`, updateData, { headers: headers });
    }
  }

  updateStatus(productId: number, active: boolean): Observable<any> {
  const url = `${this.apiUrl}/products/${productId}/status`;
  return this.http.patch(url, { active });
  }

  bulkUpdateStatus(productIds: number[], active: boolean): Observable<any> {
    const url = `${this.apiUrl}/products/bulk-status`;
    return this.http.patch(url, { productIds, active });
  }
}
