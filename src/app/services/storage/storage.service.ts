import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  getItem(key: string): any {
    if (!this.isBrowser) {
      console.warn(`Tentativa de acessar localStorage no servidor. Chave: ${key}`);
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Erro ao recuperar do localStorage (key: ${key}):`, error);
      return null;
    }
  }

  setItem(key: string, value: any): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage (key: ${key}):`, error);
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover do localStorage (key: ${key}):`, error);
    }
  }

  clear(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar o localStorage:', error);
    }
  }
}
