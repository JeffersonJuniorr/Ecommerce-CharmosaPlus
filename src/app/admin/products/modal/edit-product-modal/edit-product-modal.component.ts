import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService, Product } from '../../../../services/products/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackBarComponent } from '../../../../components/custom/custom-snack-bar/custom-snack-bar.component';

@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRippleModule,
  ],
  templateUrl: './edit-product-modal.component.html',
  styleUrls: ['./edit-product-modal.component.css'],
})
export class EditProductModalComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string = '';
  editableProduct: Partial<Product> & { active?: boolean; discount?: number };
  imagePreview: string | ArrayBuffer | null = null;
  selectedImage: File | null = null;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<EditProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Product,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {
    // Inicializa como uma cópia do produto original
    this.editableProduct = {
      ...product,
      active: (product as Partial<Product> & { active?: boolean }).active !== undefined ? (product as Partial<Product> & { active?: boolean }).active : true,
      //active: product.active !== undefined ? product.active : true, // antes de remover o category
      // discount: product.discount || 0
    };

    if (this.product.imageUrls && this.product.imageUrls.length > 0) {
      this.imagePreview = this.product.imageUrls[0] as string;
    }
  }

  ngOnInit(): void {
    console.log('Produto recebido para edição:', this.product);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  triggerImageUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'A imagem não pode exceder 5MB.';
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.errorMessage = 'Formato não suportado. Use JPEG, PNG ou WebP.';
        return;
      }

      this.selectedImage = file;
      this.errorMessage = '';

      // Exibir pré-visualização da imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedImage = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getColorsArray(): string[] {
    if (!this.editableProduct.colors) return [];
    return Array.isArray(this.editableProduct.colors)
      ? this.editableProduct.colors
      : JSON.parse(this.editableProduct.colors || '[]');
  }

  addColor(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const colors = this.getColorsArray();
      if (!colors.includes(value)) {
        colors.push(value);
        this.editableProduct.colors = colors;
      }
    }
    event.chipInput!.clear();
  }

  removeColor(color: string): void {
    const colors = this.getColorsArray();
    const index = colors.indexOf(color);
    if (index >= 0) {
      colors.splice(index, 1);
      this.editableProduct.colors = colors;
    }
  }

  getColorBackground(color: string): string {
    const standardColors: { [key: string]: string } = {
      preto: '#000000',
      branco: '#FFFFFF',
      vermelho: '#FF0000',
      azul: '#0000FF',
      verde: '#008000',
      amarelo: '#FFFF00',
      laranja: '#FFA500',
      roxo: '#800080',
      rosa: '#FFC0CB',
      cinza: '#808080',
      marrom: '#A52A2A',
      bege: '#F5F5DC',
    };

    return standardColors[color.toLowerCase()] || '#E0E0E0';
  }

  isLightColor(color: string): boolean {
    const colorCode = this.getColorBackground(color);
    // Remove o # e converte para RGB
    const hex = colorCode.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  getSizesArray(): string[] {
    if (!this.editableProduct.sizes) return [];
    return Array.isArray(this.editableProduct.sizes)
      ? this.editableProduct.sizes
      : JSON.parse(this.editableProduct.sizes || '[]');
  }

  addSize(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toUpperCase();
    if (value) {
      const sizes = this.getSizesArray();
      if (!sizes.includes(value)) {
        sizes.push(value);
        this.editableProduct.sizes = sizes;
      }
    }
    event.chipInput!.clear();
  }

  removeSize(size: string): void {
    const sizes = this.getSizesArray();
    const index = sizes.indexOf(size);
    if (index >= 0) {
      sizes.splice(index, 1);
      this.editableProduct.sizes = sizes;
    }
  }

  showCustomSnackBar(message: string, type: 'success' | 'error'): void {
    const config: MatSnackBarConfig = {
      data: { message, type },
      duration: 4500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [
        type === 'success' ? 'success-snackbar' : 'error-snackbar',
        'fixed-snackbar',
      ],
    };

    this.snackBar.openFromComponent(CustomSnackBarComponent, config);
  }

  saveProduct(): void {
    if (!this.product.id) {
      this.errorMessage = 'ID do produto não encontrado.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('name', this.editableProduct.name || '');
      formData.append('description', this.editableProduct.description || '');
      formData.append('price', String(this.editableProduct.price || 0));

      // Area do desconto
      if (this.editableProduct.discount !== undefined) {
        formData.append('discount', String(this.editableProduct.discount));
      }

      // Status (ativo/inativo)
      if (this.editableProduct.active !== undefined) {
        formData.append('active', String(this.editableProduct.active));
      }

      const colors = this.getColorsArray();
      const sizes = this.getSizesArray();

      colors.forEach((color: string) => {
        formData.append('colors', color);
      });

      sizes.forEach((size: string) => {
        formData.append('sizes', size);
      });

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      this.productService.updateProduct(this.product.id, formData).subscribe(
        (response) => {
          console.log('Produto atualizado com sucesso:', response);
          this.showCustomSnackBar('Produto atualizado com sucesso!', 'success');
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        (error) => {
          console.error('Erro ao atualizar o produto', error);
          this.errorMessage = `Não foi possível atualizar o produto. ${
            error.message || ''
          }`;
          this.isLoading = false;
          this.showCustomSnackBar('Erro ao atualizar o produto', 'error');
        }
      );
    } catch (err: any) {
      this.errorMessage = `Erro ao processar os dados: ${err.message}`;
      this.isLoading = false;
      this.showCustomSnackBar(
        `Erro ao processar os dados: ${err.message}`,
        'error'
      );
    }
  }
}
