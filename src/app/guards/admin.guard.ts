import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('userRole');
    if (role === 'ADMIN') {
      return true;
    }

    alert('Acesso negado! Você não é um administrador.');
    this.router.navigate(['/home']); 
    return false;
  }
}
