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
import { CustomSnackBarComponent } from '../../../components/custom/custom-snack-bar/custom-snack-bar.component';

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
    // CustomSnackBarComponent
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
    if (this.selectedFiles.length < 1) {
      this.showAlert('Selecione pelo menos 1 imagem para o produto', true);
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

  showAlert(message: string, isError: boolean = false) {
    this.snackBar.openFromComponent(CustomSnackBarComponent, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError
        ? ['error-snackbar', 'custom-snackbar']
        : ['success-snackbar', 'custom-snackbar'],
      data: { message, type: isError ? 'error' : 'success' },
    });
  }

  addProduct() {
    if (!this.validateImages()) {
      return;
    }
    if (!this.productForm.valid) {
      this.showAlert('Selecione exatamente 2 imagens para o produto', true);
      return;
    }

    const formData = new FormData();

    const formValue = this.productForm.value;
    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('price', formValue.price.toString());
    // formData.append('quantity', formValue.quantity?.toString() ?? '0');
    formData.append('active', formValue.active.toString());

    const totalQuantity = this.variations.reduce(
      (sum, v) => sum + (v.quantity || 0),
      0
    );

    if (totalQuantity <= 0) {
      this.showAlert(
        'Informe a quantidade de estoque do produto.',
        true
      );
      return;
    }

    formData.append('quantity', totalQuantity.toString());

    this.variations.forEach((v) => {
      // envia cor sem "#"
      const colorCode = v.color.startsWith('#') ? v.color.slice(1) : v.color;
      formData.append('colors', colorCode);
      formData.append('sizes', v.size);
    });

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    const uniqueKeys = new Set();
    for (let [key, value] of formData.entries()) {
      if (uniqueKeys.has(key)) console.warn('⚠️ Campo duplicado:', key);
      uniqueKeys.add(key);
      console.log(key, value);
    }

    for (let [k, v] of formData.entries()) console.log(k, v);
    // debug: imprime tudo que vai no request
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }

    this.productService.addProduct(formData).subscribe({
      next: (res) => {
        this.showAlert('Produto cadastrado com sucesso!');
      },
      error: (err) => {
        this.showAlert('Preencha todos os campos obrigatórios', true);
      },
    });
  }
}
