import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient, private storageService: StorageService) {}

  // Método para login
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.baseUrl}/login`, body, {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      tap((response: any) => {
        // Salvar token e role no localStorage apenas no navegador
        if (this.isBrowser && response?.token && response?.role) {
          this.storageService.setItem('authToken', response.token);
          this.storageService.setItem('userRole', response.role); // Role do usuário
        }
      })
    );
  }

  // Método para registro
  register(data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    gender: string;
    cep: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  // Método para logout
  logout(): void {
    if (this.isBrowser) {
      this.storageService.clear();
    }
  }

  // Método para verificar autenticação
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!this.storageService.getItem('authToken');
  }

  // Método para verificar se o usuário é administrador
  isAdmin(): boolean {
    if (!this.isBrowser) return false;
    return this.storageService.getItem('userRole') === 'admin';
  }
}
