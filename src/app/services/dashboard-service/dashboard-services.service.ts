import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor() {}

  // Simulação de dados do backend
  getOrderSummary(): Observable<any> {
    return of({
      novosPedidos: 43,
      totalPedidos: 3265,
      processamento: 12,
      totalProcessamento: 3178,
      aCaminho: 4,
      prontoParaEnviar: 25,
      pedidosConcluidos: 43,
      totalPedidosConcluidos: 6532,
    });
  }

  getWeeklySales(): Observable<any[]> {
    return of([
      { dia: 'Domingo', valor: 35, cor: '#FFD700' },
      { dia: 'Segunda-feira', valor: 22, cor: '#1E90FF' },
      { dia: 'Terça-feira', valor: 25, cor: '#8A2BE2' },
      { dia: 'Quarta-feira', valor: 27, cor: '#FF0000' },
      { dia: 'Quinta-feira', valor: 20, cor: '#32CD32' },
      { dia: 'Sexta-feira', valor: 35, cor: '#FF8C00' },
      { dia: 'Sábado', valor: 33, cor: '#00CED1' },
    ]);
  }

  getMonthHighlights(): Observable<any> {
    return of({
      total: 569,
      categorias: [
        { nome: 'Vestido', valor: 200, cor: '#0000FF' },
        { nome: 'Macaquinho', valor: 150, cor: '#8A2BE2' },
        { nome: 'Conjunto', valor: 120, cor: '#FFD700' },
        { nome: 'Short', valor: 99, cor: '#32CD32' },
      ]
    });
  }
}
