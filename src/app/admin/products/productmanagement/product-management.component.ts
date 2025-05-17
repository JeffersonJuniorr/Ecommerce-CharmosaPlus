import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/products/products.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface ProductVariation {
  size: string;
  color: string;
  quantity?: number;
  // model: string;
}

@Component({
  standalone: true,
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
})
export class ProductManagementComponent implements OnInit {
  productForm: FormGroup;
  variations: ProductVariation[] = [];
  selectedFiles: File[] = [];
  activeTab: 'general' | 'stock' | 'images' = 'general';
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      weight: [''],
      width: [''],
      height: [''],
      length: [''],
      costPrice: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
      // quantity: ['', [Validators.required, Validators.min(0)]],
      active: [true],

    });
    this.addVariation();
  }

  ngOnInit() {
    // this.addVariation(); // Adiciona uma variação inicial
  }

  addVariation() {
    this.variations.push({
      size: '',
      color: '#000000',
      // quantity: 0,
      // model: '',
    });
  }

  removeVariation(index: number) {
    this.variations.splice(index, 1);
  }

  onFileChange(event: any) {
    // Libera as URLs das imagens anteriores para evitar vazamento de memória
    this.selectedFiles.forEach((file) => {
      URL.revokeObjectURL(this.getPreview(file) as string);
    });

    // Adiciona as novas imagens às existentes (em vez de substituir)
    const newFiles = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...newFiles];

    //  Limitador de imagem, ex: limite 10 imagens
    // this.selectedFiles = combinedFiles.slice(0, 10);

    // if (combinedFiles.length > 10) {
    //   this.snackBar.open('Máximo de 10 imagens atingido', 'Fechar', {
    //     duration: 3000,
    //   });
    // }

    this.changeDetector.detectChanges();
  }

  getPreview(file: File): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }

  removeImage(index: number, file: File) {
    URL.revokeObjectURL(this.getPreview(file) as string);
    this.selectedFiles.splice(index, 1);
    this.changeDetector.detectChanges();
  }

  onImageLoad() {
    this.changeDetector.detectChanges();
  }

  validateImages(): boolean {
    if (this.selectedFiles.length !== 2) {
      this.snackBar.open(
        'Selecione exatamente 2 imagens para o produto',
        'Fechar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      return false;
    }
    return true;
  }

  calculateDiscount(): number {
    const cost = this.productForm.get('price')?.value;
    const price = this.productForm.get('costPrice')?.value;
    if (cost && price && cost > price) {
      return Math.round(((cost - price) / cost) * 100);
    }
    return 0;
  }

  nextTab() {
    if (this.activeTab === 'general') {
      this.activeTab = 'stock';
    } else if (this.activeTab === 'stock') {
      this.activeTab = 'images';
    }
  }

  previousTab() {
    if (this.activeTab === 'stock') {
      this.activeTab = 'general';
    } else if (this.activeTab === 'images') {
      this.activeTab = 'stock';
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      const formData = new FormData();
      const formValue = this.productForm.value;
      const totalQuantity = this.variations.reduce(
        (sum, variation) => sum + (variation.quantity || 0),
        0
      );
      const productData = {
        ...formValue,
        price: formValue.costPrice, // Envia o preço de custo como "price" para o backend
        salePrice: formValue.price,
        quantity: totalQuantity,
      };

      if (totalQuantity <= 0) {
        this.snackBar.open(
          'Adicione pelo menos uma variação com quantidade',
          'Fechar',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
        return;
      }

      Object.keys(productData).forEach((key) => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });

      // Adiciona variações
      this.variations.forEach((variation, index) => {
        if (variation.size)
          formData.append(`variations[${index}][size]`, variation.size);
        if (variation.color)
          formData.append(`variations[${index}][color]`, variation.color);
        // formData.append(
        //   `variations[${index}][quantity]`,
        //   variation.quantity.toString()
        // );
        // if (variation.model)
        //   formData.append(`variations[${index}][model]`, variation.model);
      });

      // Adiciona imagens
      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      this.productService.addProduct(formData).subscribe({
        next: () => {
          this.snackBar.open('Produto cadastrado com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.productForm.reset();
          this.variations = [];
          this.selectedFiles = [];
          this.addVariation();
        },
        error: (error) => {
          console.error('Erro ao cadastrar produto:', error);
          this.snackBar.open('Erro ao cadastrar produto', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}
