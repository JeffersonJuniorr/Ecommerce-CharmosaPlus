import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProductService, Product } from '../../../services/products/products.service';
import { StorageService } from '../../../services/storage/storage.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { PageCustomizerComponent } from '../../page-customizer/page-customizer.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-list-products',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.css'],
})
export class ListProductsComponent implements OnInit {
  products: (Product & { thumbnailUrl?: SafeUrl; selected?: boolean })[] = [];
  loading = true;
  error: string | null = null;

  // Status control
  bulkStatusAction: 'active' | 'inactive' | null = null;
  allSelected = false;
  someSelected = false;

  // filtros e controles
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  searchTerm = '';
  sortField: 'name' | 'quantity' | 'price' = 'name';
  sortAsc = true;

  sortOptions = [
    { value: 'name-asc', label: 'Nome (A-Z)' },
    { value: 'name-desc', label: 'Nome (Z-A)' },
    { value: 'quantity-asc', label: 'Estoque (Menor-Maior)' },
    { value: 'quantity-desc', label: 'Estoque (Maior-Menor)' },
    { value: 'price-asc', label: 'Preço (Menor-Maior)' },
    { value: 'price-desc', label: 'Preço (Maior-Menor)' },
  ];

  // paginação
  currentPage = 1;
  pageSize = 5;
  showAll = false;

  constructor(
    private sanitizer: DomSanitizer,
    private storageService: StorageService,
    private productService: ProductService,
     private changeDetectorRef: ChangeDetectorRef,
     private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products = prods.map((p) => ({ ...p, selected: false }));
        this.products.forEach((p) => this.loadThumbnail(p));
        this.updateSelectionState();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar produtos.';
        this.loading = false;
      },
    });
  }

  openCustomizer() {
  this.dialog.open(PageCustomizerComponent, {
    width: '800px',
    data: { /* se precisar passar algo */ }
    });
  }

  // ngOnInit(): void {
  //   this.productService.getProducts().subscribe({
  //     next: (prods) => {
  //       // inicializa array estendido
  //       this.products = prods.map((p) => ({ ...p }));
  //       // para cada produto, carrega a thumbnail
  //       this.products.forEach((p) => this.loadThumbnail(p));
  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.error = 'Erro ao carregar produtos.';
  //       this.loading = false;
  //     },
  //   });
  // }

  private generateImageUrl(productId: number, imageId: number): string {
    const token = this.storageService.getItem('authToken') || '';
    return `${
      environment.apiUrl
    }/products/${productId}/images?imageId=${imageId}${
      token ? `&token=${token}` : ''
    }`;
  }

  private loadThumbnail(p: Product & { thumbnailUrl?: SafeUrl }) {
    // Primeiro tenta carregar com imageId igual ao productId
    this.tryLoadImage(p, p.id).subscribe({
      error: () => {
        // Se falhar, tenta com imageId=1 como fallback
        this.tryLoadImage(p, 1).subscribe({
          error: (err) => {
            console.error(`Erro ao carregar imagem para produto ${p.id}:`, err);
            p.thumbnailUrl = undefined;
          },
        });
      },
    });
  }

  private tryLoadImage(
    p: Product & { thumbnailUrl?: SafeUrl },
    imageId: number
  ): Observable<Blob> {
    return new Observable((observer) => {
      this.products.forEach(p => {
  this.productService.getProductImagesBase64(p.id).subscribe({
    next: base64List => {
      if (base64List.length) {
        const uri = `data:image/jpeg;base64,${base64List[0]}`;
        p.thumbnailUrl = this.sanitizer.bypassSecurityTrustUrl(uri);
      }
    },
    error: () => {
      // sem imagem → deixa p.thumbnailUrl undefined
    }
  });
});
    });
  }

  get filteredProducts(): Product[] {
    return this.products
      .filter((p) => {
        if (this.filterStatus === 'active') return p.active;
        if (this.filterStatus === 'inactive') return !p.active;
        return true;
      })
      .filter((p) =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
  }

  get sortedProducts(): Product[] {
    return this.filteredProducts.sort((a, b) => {
      let aVal, bVal;

      switch (this.sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'quantity':
          aVal = a.quantity ?? 0;
          bVal = b.quantity ?? 0;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (aVal < bVal) return this.sortAsc ? -1 : 1;
      if (aVal > bVal) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }

  get pagedProducts(): Product[] {
    if (this.showAll) {
      return this.sortedProducts; // Retorna todos quando showAll é true
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.sortedProducts.length / this.pageSize);
  }

  onPageSizeChange(): void {
    this.showAll = this.pageSize === null;
    this.currentPage = 1;
  }

  setFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus = status;
    this.currentPage = 1;
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
  }

  applySort(): void {
    if (!this.sortField) return;

    if (this.sortField === 'name') {
      // Mantém o padrão (nome ascendente)
      this.sortField = 'name';
      this.sortAsc = true;
      return;
    }

    const [field, direction] = this.sortField.split('-');
    this.sortField = field as 'name' | 'quantity' | 'price';
    this.sortAsc = direction === 'asc';
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  reloadProducts(): void {
    this.loading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products = prods.map((p) => ({ ...p }));
        this.products.forEach((p) => this.loadThumbnail(p));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar produtos.';
        this.loading = false;
      },
    });
  }

  toggleSelectAll(): void {
  this.allSelected = !this.allSelected;
  this.products.forEach(product => {
    product.selected = this.allSelected;
  });
  this.updateSelectionState();
}

  toggleProductSelection(product: Product & { selected?: boolean }): void {
    product.selected = !product.selected;
    this.updateSelectionState();
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.currentPage = 1; // Reseta para a primeira página
  }

  updateSelectionState(): void {
  const selectedCount = this.products.filter(p => p.selected).length;
  this.allSelected = selectedCount === this.products.length && this.products.length > 0;
  this.someSelected = selectedCount > 0 && !this.allSelected;
  
  // Força a atualização da view
  this.changeDetectorRef.detectChanges();
}

  // Métodos de alteração de status
  setBulkStatus(status: 'active' | 'inactive'): void {
    this.bulkStatusAction = status;
  }

  confirmBulkStatusChange(): void {
    if (!this.bulkStatusAction) return;

    const selectedProducts = this.products.filter((p) => p.selected);
    if (selectedProducts.length === 0) return;

    const newStatus = this.bulkStatusAction === 'active';
    const productIds = selectedProducts.map((p) => p.id);

    // Atualiza apenas no frontend
    selectedProducts.forEach((p) => (p.active = newStatus));

    // Feedback visual
    this.error = null;
    this.bulkStatusAction = null;

    // Opcional: Mostrar mensagem de sucesso
    console.log(`Status atualizado para ${selectedProducts.length} produtos`);
  }

  toggleProductStatus(product: Product): void {
    // Atualiza apenas no frontend
    product.active = !product.active;

    // Feedback visual
    console.log(
      `Status do produto ${product.id} alterado para ${
        product.active ? 'Ativo' : 'Inativo'
      }`
    );
  }
}
