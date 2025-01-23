import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  
  // Salva um item no localStorage
  setItem(key: string, value: any): void {
    try {
      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Erro ao salvar no localStorage (key: ${key}):`, error);
    }
  }

  // Recupera um item do localStorage
  getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);

      // retorna o valor bruto se não for JSON
      try {
        return value ? JSON.parse(value) : null;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Erro ao recuperar do localStorage (key: ${key}):`, error);
      return null;
    }
  }

  // Remove um item do localStorage
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover do localStorage (key: ${key}):`, error);
    }
  }

  // Limpa todo o localStorage
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar o localStorage:', error);
    }
  }

  // Verifica se um item existe no localStorage
  hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Erro ao verificar a existência do item (key: ${key}):`, error);
      return false;
    }
  }
}
