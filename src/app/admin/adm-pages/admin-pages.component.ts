import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, ProductService } from '../../services/products/products.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-adm-pages',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-pages.component.html',
  styleUrl: './admin-pages.component.css'
})
export class AdminPagesComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = ['home', 'destaques', 'promoções', 'novidades'];
  
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
      this.productService.getProducts().subscribe(
        (data: Product[]) => {
          this.products = data.map((product) => ({
            ...product,
            imageUrls: Array.isArray(product.imageUrls) 
              ? product.imageUrls.map((url) => {
                  if (typeof url === 'string') {
                    return `${environment.apiUrl}/products/${product.id}/images/${url.split('/').pop()}`;
                  }
                  return '';
                }).filter(url => url !== '')
              : []
          }));
          console.log('Produtos recebidos:', this.products);
        },
        (error: any) => console.error('Erro ao carregar produtos:', error)
      );
    }

  updateProductCategory(product: Product, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newCategory = target.value;
  
    if (!product.id) {
      console.error('Produto sem ID não pode ser atualizado.');
      return;
    }
  
    product.category = newCategory;
  
    this.productService.updateProduct(product.id, { category: newCategory }).subscribe(
      () => {
        console.log(`Produto ${product.name} atualizado para a categoria ${newCategory}`);
      },
      (error: any) => console.error('Erro ao atualizar categoria do produto:', error)
    );
  }
  

  deleteProduct(id: number) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(product => product.id !== id);
      });
    }
  }
}