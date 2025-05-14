import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ExtractService } from '../../services/extract/extract.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { Chart } from 'chart.js';

@Component({
  imports: [CommonModule, FormsModule, RouterModule, NgClass],
  selector: 'app-extract-admin',
  templateUrl: './extract-admin.component.html',
  styleUrls: ['./extract-admin.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ExtractAdminComponent implements OnInit {

  summary: any = {
    availableBalance: 0,
    monthSales: 0,
    productsSold: 0,
  };

  salesPerformance: any = {
    labels: ['Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro'],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: [5000, 7000, 6000, 8000, 9000, 10000],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  products: any[] = [];

  // Lista de produtos mais vendidos
  topProducts: any[] = [
    {
      name: 'Conjunto Alfaiataria',
      sold: 42,
      revenue: 6560,
      image: 'assets/products/banner1.jpg',
    },
    {
      name: 'Vestido Duna',
      sold: 32,
      revenue: 3808,
      image: 'assets/products/banner2.jpg',
    },
    {
      name: 'Macaquinho Duna',
      sold: 23,
      revenue: 2990,
      image: 'assets/products/banner3.jpg',
    },
    {
      name: 'Conjunto Alfaiataria',
      sold: 42,
      revenue: 6560,
      image: 'assets/products/banner1.jpg',
    },
    {
      name: 'Vestido Duna',
      sold: 32,
      revenue: 3808,
      image: 'assets/products/banner2.jpg',
    },
    {
      name: 'Macaquinho Duna',
      sold: 23,
      revenue: 2990,
      image: 'assets/products/banner3.jpg',
    },
    {
      name: 'Conjunto Alfaiataria',
      sold: 42,
      revenue: 6560,
      image: 'assets/products/banner1.jpg',
    },
    {
      name: 'Vestido Duna',
      sold: 32,
      revenue: 3808,
      image: 'assets/products/banner2.jpg',
    },
    {
      name: 'Macaquinho Duna',
      sold: 23,
      revenue: 2990,
      image: 'assets/products/banner3.jpg',
    },
    
  ];

  transactions: any[] = [];
  filteredTransactions: any[] = [];

  // Filtros e paginação
  searchQuery: string = '';
  showAdvancedFilters: boolean = false;
  filters: any = {
    startDate: '',
    endDate: '',
    status: '',
    product: '',
    minValue: null,
    maxValue: null,
    customer: '',
  };
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  productList: any[] = [];

  // Modais
  modals: any = {
    withdrawal: false,
    calendar: false,
    productAnalytics: false,
    transactionDetails: false,
  };
  withdrawalAmount: number = 0;
  selectedAccount: string | null = null;
  bankAccounts: any[] = [
    { id: '1', bank: 'Banco A', number: '1234-5', icon: 'cc-mastercard' },
    { id: '2', bank: 'Banco B', number: '6789-0', icon: 'cc-visa' },
  ];
  calendarView: string = 'month';
  calendarDays: any[] = [];
  calendarSummary: any = {
    totalSales: 0,
    totalAmount: 0,
    dailyAverage: 0,
    bestDay: '',
  };
  selectedProduct: any = null;
  productAnalytics: any = null;
  selectedTransaction: any = null;

  // Ordenação
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private extractService: ExtractService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loadSummary();
    this.loadProducts();
    this.loadTransactions();
  }

  loadSummary() {
    this.summary = {
      availableBalance: 5000,
      monthSales: 280,
      productsSold: 6,
    };
  }

  loadProducts() {
    this.extractService.getProducts().subscribe(
      (data) => {
        this.products = data;
        this.productList = data
      },
      (error) => {
        console.error('Erro ao carregar produtos:', error);
      }
    );
  }

  loadTransactions() {
    this.transactions = [
      {
        id: 1,
        date: '2023-10-01',
        customer: 'Cliente A',  
        value: 150.0,
        status: 'completed',
        products: [
          {
            name: 'Produto A',
            sku: 'SKU001',
            size: 'M',
            quantity: 1,
            price: 50,
            image: 'assets/products/banner1.jpg',
          },
          {
            name: 'Produto B',
            sku: 'SKU002',
            size: 'L',
            quantity: 2,
            price: 50,
            image: 'assets/products/banner3.jpg',
          },
        ],
      },
      {
        id: 2,
        date: '2023-10-02',
        customer: 'Cliente B',
        value: 75.0,
        status: 'pending',
        products: [
          {
            name: 'Produto C',
            sku: 'SKU003',
            size: 'S',
            quantity: 1,
            price: 75,
            image: 'assets/products/banner2.jpg',
          },
        ],
      },
      {
        id: 3,
        date: '2023-10-03',
        customer: 'Cliente C',
        value: 200.0,
        status: 'completed',
        products: [
          {
            name: 'Produto A',
            sku: 'SKU001',
            size: 'M',
            quantity: 4,
            price: 50,
            image: 'assets/products/banner3.jpg',
          },
        ],
      },
      {
        id: 4,
        date: '2023-10-04',
        customer: 'Cliente D',
        value: 120.0,
        status: 'canceled',
        products: [
          {
            name: 'Produto D',
            sku: 'SKU004',
            size: 'XL',
            quantity: 2,
            price: 60,
            image: 'assets/products/banner1.jpg',
          },
        ],
      },
    ];

    this.filteredTransactions = this.transactions;
    this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }


  renderChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (ctx) {
      const salesChart = new Chart(ctx, {
        type: 'line',
        data: this.salesPerformance,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      console.error('Elemento canvas não encontrado!');
    }
  }

  // Aplica os filtros
  applyFilters() {
    this.filteredTransactions = this.transactions.filter((transaction) => {
      return (
        (!this.filters.startDate || transaction.date >= this.filters.startDate) &&
        (!this.filters.endDate || transaction.date <= this.filters.endDate) &&
        (!this.filters.status || transaction.status === this.filters.status) &&
        (!this.filters.product ||
          transaction.products.some(
            (product: any) => product.name === this.filters.product
          )) &&
        (!this.filters.minValue || transaction.value >= this.filters.minValue) &&
        (!this.filters.maxValue || transaction.value <= this.filters.maxValue) &&
        (!this.filters.customer ||
          transaction.customer.toLowerCase().includes(this.filters.customer.toLowerCase()))
      );
    });
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  // Reseta os filtros
  resetFilters() {
    this.filters = {
      startDate: '',
      endDate: '',
      status: '',
      product: '',
      minValue: null,
      maxValue: null,
      customer: '',
    };
    this.filteredTransactions = this.transactions;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
  }

  // Realiza a busca
  search() {
    this.filteredTransactions = this.transactions.filter(
      (transaction) =>
        transaction.id.toString().includes(this.searchQuery) ||
        transaction.customer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        transaction.products.some((product: any) =>
          product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  // Formata valores monetários
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  // Formata datas
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Alterna a visibilidade dos filtros avançados
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Navega entre as páginas
  goToPage(page: string | number) {
    this.currentPage = typeof page === 'string' ? parseInt(page, 10) : page;
  }

  // Retorna o intervalo de paginação
  getPaginationRange(): (number | string)[] {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  // Ordena as transações por uma coluna
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredTransactions.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Retorna o ícone de ordenação para uma coluna
  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
    return 'fa-sort';
  }

  // Abre o modal de retirada de dinheiro
  openWithdrawalModal() {
    this.modals.withdrawal = true;
  }

  // Fecha um modal específico
  closeModal(modalName: string) {
    this.modals[modalName] = false;
  }

  // Visualiza os detalhes de uma transação
  viewTransactionDetails(transaction: any) {
    this.selectedTransaction = transaction; //bug modal
    this.modals.transactionDetails = true;
  }

  // Gera a fatura de uma transação
  generateInvoice(transaction: any) {
    console.log('Gerando fatura para a transação:', transaction);
  }

  // Verifica se algum modal está aberto
  isAnyModalOpen(): boolean {
    return Object.values(this.modals).some((modal) => modal);
  }

  // Fecha todos os modais
  closeAllModals() {
    for (const modal in this.modals) {
      this.modals[modal] = false;
    }
  }

  // Alterna a visibilidade dos detalhes dos produtos
  toggleProductDetails(transactionId: number) {
    const detailsRow = document.getElementById(`details-${transactionId}`);
    if (detailsRow) {
      detailsRow.classList.toggle('show');
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  }

  // Exporta o relatório
  exportReport() {
    console.log('Exportando relatório...');
  }

  // Seleciona uma conta bancária
  selectAccount(accountId: string) {
    this.selectedAccount = accountId;
  }

  // Abre o formulário para adicionar uma nova conta
  openNewAccountForm() {
    console.log('Abrindo formulário para adicionar nova conta...');
  }

  // Altera a visualização do calendário
  changeCalendarView(view: string) {
    this.calendarView = view;
    this.loadCalendarData();
  }

  // Navega no calendário (próximo/anterior/hoje)
  navigateCalendar(direction: 'prev' | 'next' | 'today') {
    console.log(`Navegando no calendário: ${direction}`);
  }

  // Retorna o título do calendário
  getCalendarTitle(): string {
    return 'Calendário de Vendas';
  }

  // Exporta os dados do calendário
  exportCalendarData() {
    console.log('Exportando dados do calendário...');
  }

  // Exporta a análise do produto
  exportProductAnalytics() {
    console.log('Exportando análise do produto...');
  }

  // Calcula o subtotal de uma transação
  getSubtotal(products: any[]): number {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }

  // Carrega os dados do calendário (simulado)
  private loadCalendarData() {
    this.calendarDays = [
      { day: 1, isToday: false, hasSales: true, sales: 5, amount: 250 },
      { day: 2, isToday: false, hasSales: false, sales: 0, amount: 0 },
      { day: 3, isToday: false, hasSales: true, sales: 3, amount: 150 },
      { day: 4, isToday: false, hasSales: true, sales: 8, amount: 400 },
      { day: 5, isToday: true, hasSales: true, sales: 10, amount: 500 },
    ];
    this.calendarSummary = {
      totalSales: 26,
      totalAmount: 1300,
      dailyAverage: 260,
      bestDay: '2023-10-05',
    };
  }

  // Verifica se o saque é válido
  isWithdrawalValid(): boolean {
    return (
      this.withdrawalAmount > 0 &&
      this.withdrawalAmount <= this.summary.availableBalance
    );
  }

  // Confirma o saque
  confirmWithdrawal() {
    if (this.isWithdrawalValid()) {
      console.log('Saque confirmado:', this.withdrawalAmount);
      this.closeModal('withdrawal');
    }
  }

  // Abre a confirmação de cancelamento
  openCancelConfirmation() {
    const confirmation = confirm('Tem certeza que deseja cancelar este pedido?');
    if (confirmation) {
      this.cancelTransaction(this.selectedTransaction);
    }
  }

  // Cancela a transação
  cancelTransaction(transaction: any) {
    console.log('Cancelando transação:', transaction);
    transaction.status = 'canceled';
    this.closeModal('transactionDetails');
  }

  // Abre o modal do calendário
  openCalendarModal() {
    this.modals.calendar = true;
  }

  // Carrega os detalhes dos produtos de uma transação
  loadProductDetails(transaction: any) {
    console.log('Carregando detalhes dos produtos para a transação:', transaction);
  }
}