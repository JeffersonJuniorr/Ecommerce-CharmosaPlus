import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SafeUrl } from '@angular/platform-browser';
import { StorageService } from '../../services/storage/storage.service';

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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // checkout
  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`, { headers: this.getHeaders() });
  }

  getProductImage(productId: number, imageId: number = 1): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${productId}/images?imageId=${imageId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    })
    // .pipe(
    //   catchError(error => {
    //     console.error(`Error loading image for product ${productId}, image ${imageId}:`, error);
    //     return throwError(() => error);
    //   })
    // );
  }

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
}
