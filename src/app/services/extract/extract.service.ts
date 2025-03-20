import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExtractService {
  private apiUrl = environment.apiUrl;

  // Produtos simulados
  private products = [
    { id: 1, name: 'Produto A', sku: 'SKU001', size: 'M', quantity: 1, price: 50, image: 'assets/products/produto-a.jpg' },
    { id: 2, name: 'Produto B', sku: 'SKU002', size: 'L', quantity: 1, price: 50, image: 'assets/products/produto-b.jpg' },
    { id: 3, name: 'Produto C', sku: 'SKU003', size: 'S', quantity: 1, price: 30, image: 'assets/products/produto-c.jpg' },
    { id: 4, name: 'Produto D', sku: 'SKU004', size: 'XL', quantity: 2, price: 60, image: 'assets/products/produto-d.jpg' },
  ];

  // Transações simuladas
  private transactions = [
    {
      id: 1,
      date: '2023-10-01',
      customer: 'Cliente A',
      value: 150.0,
      status: 'completed',
      products: [
        { id: 1, name: 'Produto A', sku: 'SKU001', size: 'M', quantity: 1, price: 50, image: 'assets/products/produto-a.jpg' },
        { id: 2, name: 'Produto B', sku: 'SKU002', size: 'L', quantity: 2, price: 50, image: 'assets/products/produto-b.jpg' },
      ],
    },
    {
      id: 2,
      date: '2023-10-02',
      customer: 'Cliente B',
      value: 75.0,
      status: 'pending',
      products: [
        { id: 3, name: 'Produto C', sku: 'SKU003', size: 'S', quantity: 1, price: 75, image: 'assets/products/produto-c.jpg' },
      ],
    },
    {
      id: 3,
      date: '2023-10-03',
      customer: 'Cliente C',
      value: 200.0,
      status: 'completed',
      products: [
        { id: 1, name: 'Produto A', sku: 'SKU001', size: 'M', quantity: 4, price: 50, image: 'assets/products/produto-a.jpg' },
      ],
    },
    {
      id: 4,
      date: '2023-10-04',
      customer: 'Cliente D',
      value: 120.0,
      status: 'canceled',
      products: [
        { id: 4, name: 'Produto D', sku: 'SKU004', size: 'XL', quantity: 2, price: 60, image: 'assets/products/produto-d.jpg' },
      ],
    },
  ];

  // Resumo financeiro simulado
  private summary = {
    availableBalance: 5000,
    monthSales: 280,
    productsSold: 6,
  };

  constructor(private http: HttpClient) {}

  // Retorna os produtos
  getProducts(): Observable<any[]> {
    return of(this.products); // Simula uma requisição HTTP
  }

  // Retorna as transações
  getTransactions(): Observable<any[]> {
    return of(this.transactions); // Simula uma requisição HTTP
  }

  // Retorna o resumo financeiro
  getSummary(): Observable<any> {
    return of(this.summary); // Simula uma requisição HTTP
  }

  // Simula a retirada de dinheiro
  withdrawMoney(amount: number) {
    return of({ success: true, message: `Retirada de R$${amount} realizada com sucesso!` });
  }
}