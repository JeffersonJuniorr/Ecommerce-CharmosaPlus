import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  // Método para login
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http
      .post(`${this.baseUrl}/login`, body, {
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        responseType: 'text', // Indica que a resposta é uma string em vez de um formato json (corrigido)
      })
      .pipe(
        tap((response: string) => {
          // A resposta é uma string (o token)
          if (this.isBrowser && response) {
            const token = response; // A resposta é apenas o token
            const decodedToken: any = jwtDecode(token); // Decodifica o token
            const role = this.normalizeRole(decodedToken.role); // Normaliza a role

            // Salva o token e a role no localStorage
            this.storageService.setItem('authToken', token);
            this.storageService.setItem('userRole', role);
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
    return this.http.post(`${this.baseUrl}/register`, data, {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text' // Indica que a resposta é uma string
    }).pipe(
      map((response: string) => {
        if (response === 'Usuário registrado com sucesso!') {
          return { message: response };
        } else {
          throw new Error(response); 
        }
      })
    );
  }

  // Método para normalizar a role (remover o prefixo "ROLE_")
  private normalizeRole(role: string): string {
    return role.replace('ROLE_', ''); // Remove o prefixo "ROLE_"
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
