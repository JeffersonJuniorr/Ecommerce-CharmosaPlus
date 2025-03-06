import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { ProductService, Product } from '../../../services/products/products.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CustomSnackBarComponent } from '../../../components/custom/custom-snack-bar/custom-snack-bar.component';
import { ProductListModalComponent } from '../modal/product-list-modal/product-list-modal.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatSnackBarModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
})

export class ProductManagementComponent implements OnInit {
  productForm: FormGroup;
  products: (Product & { imageUrls?: string[] })[] = [];
  deletingProductId: number | null = null;
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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

  showAlert(message: string, isError: boolean = false) {
    this.snackBar.openFromComponent(CustomSnackBarComponent, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      data: { message }
    });
  }


  openProductList() {
    const dialogRef = this.dialog.open(ProductListModalComponent, {
      width: '80%',
      maxHeight: '90vh',
      data: { products: this.products }
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.loadProducts();
      // window.location.reload(); // Recarrega a página
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
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
        console.log('Produtos carregados:', this.products);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.showAlert('Erro ao carregar produtos', true);
      }
    });
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.productForm.patchValue({ images: this.selectedFiles });
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      const formData = new FormData();
      
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);

      const colors = this.productForm.get('colors')?.value.split(',').map((c: string) => c.trim());
      const sizes = this.productForm.get('sizes')?.value.split(',').map((s: string) => s.trim());

      colors?.forEach((color: string) => formData.append('colors', color));
      sizes?.forEach((size: string) => formData.append('sizes', size));

      this.selectedFiles.forEach((file) => formData.append('images', file));

      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          this.showAlert('Produto cadastrado com sucesso!');
          this.loadProducts();
          this.productForm.reset();
          this.selectedFiles = [];
        },
        error: (error) => {
          console.error('Erro ao adicionar produto:', error);
          this.showAlert('Erro ao cadastrar produto', true);
        }
      });
    } else {
      this.showAlert('Por favor, preencha todos os campos obrigatórios', true);
    }
  }

  deleteProduct(id: number) {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.deletingProductId = id;
      
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.showAlert('Produto excluído com sucesso!');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Erro ao excluir produto:', error);
          this.showAlert('Erro ao excluir produto', true);
        },
        complete: () => {
          this.deletingProductId = null;
        }
      });
    }
  }
}