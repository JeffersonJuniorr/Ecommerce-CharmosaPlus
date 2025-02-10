import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SafeUrl } from '@angular/platform-browser';
import { StorageService } from '../../services/storage/storage.service';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  colors: string[];
  sizes: string[];
  images?: File[];
  imageUrls?: (string | SafeUrl)[];
  category?: string;
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

  // Buscar todos os produtos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Adicionar um novo produto
  addProduct(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  // Deletar Produto
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Aqui, Partial<Product> permite que a API receba apenas os campos que estão sendo atualizados, como category
  updateProduct(id: number, updateData: Partial<Product>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updateData, { headers: this.getHeaders() });
  }
}
