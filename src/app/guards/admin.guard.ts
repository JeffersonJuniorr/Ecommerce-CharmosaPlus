import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    const role = this.storageService.getItem('userRole');
    if (role === 'ADMIN') {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
