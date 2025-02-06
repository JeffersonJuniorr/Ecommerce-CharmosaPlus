import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { ProductService, Product } from '../../../services/products/products.service';

@Component({
  standalone: true,
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductManagementComponent implements OnInit {
  productForm: FormGroup;
  products: (Product & { imageUrls?: string[] })[] = [];
  deletingProductId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      name: [''],
      description: [''],
      price: [''],
      colors: [''],
      sizes: [''],
      images: [null],
    });
  }

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

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.productForm.patchValue({ images: Array.from(files) });
    }
  }

  addProduct() {
    const formData = new FormData();
    
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);

    const colors = this.productForm.get('colors')?.value.split(',').map((c: string) => c.trim());
    const sizes = this.productForm.get('sizes')?.value.split(',').map((s: string) => s.trim());

    if (colors?.length > 0) {
      colors.forEach((color: string) => formData.append('colors', color));
    }
    if (sizes?.length > 0) {
      sizes.forEach((size: string) => formData.append('sizes', size));
    }

    const images: File[] = this.productForm.get('images')?.value;
    if (images?.length) {
      images.forEach((file) => formData.append('images', file));
    }

    this.productService.addProduct(formData).subscribe({
      next: (response: any) => {
        console.log('Produto adicionado com sucesso!', response);
        this.loadProducts();
        this.productForm.reset();
      },
      error: (error: any) => {
        console.error('Erro ao adicionar produto:', error);
      }
    });
  }

  deleteProduct(id: number) {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.deletingProductId = id;
      
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          console.log('Produto excluído com sucesso!');
          this.loadProducts();
        },
        error: (error: any) => {
          console.error('Erro ao excluir produto:', error);
          if (error.status === 401 || error.status === 403) {
            alert('Sessão expirada ou sem permissão. Por favor, faça login novamente.');
            // Aqui você pode redirecionar para a página de login se necessário
            // this.router.navigate(['/login']);
          } else {
            alert('Erro ao excluir produto. Por favor, tente novamente.');
          }
        },
        complete: () => {
          this.deletingProductId = null;
        }
      });
    }
  }
}