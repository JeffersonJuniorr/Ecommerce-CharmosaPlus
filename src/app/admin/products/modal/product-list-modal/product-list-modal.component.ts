import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../../../../services/products/products.service';
import { environment } from '../../../../../environments/environment.development';
import { MatDialog } from '@angular/material/dialog';
import { EditProductModalComponent } from '../edit-product-modal/edit-product-modal.component';

@Component({
  standalone: true,
  selector: 'app-product-list-modal',
  templateUrl: './product-list-modal.component.html',
  styleUrls: ['./product-list-modal.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule
  ],
})
export class ProductListModalComponent implements OnInit {
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  searchText: string = '';
  isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] },
    private dialogRef: MatDialogRef<ProductListModalComponent>,
    private productService: ProductService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.allProducts = this.data.products;
    this.filteredProducts = this.allProducts;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchText = filterValue;
    
    this.filteredProducts = this.allProducts.filter(product => 
      product.name.toLowerCase().includes(filterValue) || 
      (product.id !== undefined && product.id.toString().includes(filterValue))
    );
  }

  deleteProduct(id: number) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: (response) => {
          console.log('Resposta do backend:', response);
          
          this.allProducts = this.allProducts.filter(p => p.id !== id);
          this.filteredProducts = this.filteredProducts.filter(p => p.id !== id);
          
          this.cdr.detectChanges();
          console.log('Produto excluído com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir produto:', error);
        }
      });
    }
  }

  refreshProducts() {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data;
        
        if (this.searchText) {
          this.filteredProducts = this.allProducts.filter(product => 
            product.name.toLowerCase().includes(this.searchText) || 
            (product.id !== undefined && product.id.toString().includes(this.searchText))
          );
        } else {
          this.filteredProducts = this.allProducts;
        }
        
        console.log('Produtos atualizados:', this.allProducts);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
      }
    });
  }

  openEditModal(product: Product): void {
    const dialogRef = this.dialog.open(EditProductModalComponent, {
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Produto editado:', result);
        this.refreshProducts();
      }
    });
  }
}