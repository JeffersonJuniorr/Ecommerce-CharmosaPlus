import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/auth';

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
        // Salvar token e role no localStorage usando StorageService
        if (response && response.token && response.role) {
          this.storageService.setItem('authToken', response.token);
          this.storageService.setItem('userRole', response.role);
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
    // Limpar localStorage ao fazer logout
    this.storageService.clear();
  }

  // Método para verificar autenticação
  isAuthenticated(): boolean {
    const token = this.storageService.getItem('authToken');
    return !!token; // Retorna true se o token estiver presente
  }
}
