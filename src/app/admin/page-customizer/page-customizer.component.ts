import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { Product, ProductService } from '../../services/products/products.service';
import { StorageService } from '../../services/storage/storage.service';
import { MatIconModule } from '@angular/material/icon';
import { CustomSnackBarComponent } from '../../components/custom/custom-snack-bar/custom-snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-page-customizer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './page-customizer.component.html',
  styleUrls: ['./page-customizer.component.css'],
})
export class PageCustomizerComponent implements OnInit {
  form: FormGroup;
  products: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<PageCustomizerComponent>,
    private storage: StorageService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      slots: this.fb.array([]),
    });
  }

  get slots(): FormArray {
    return this.form.get('slots') as FormArray;
  }

  ngOnInit() {
    // busca lista de produtos para popular o <select>
    this.productService
      .getProducts()
      .subscribe((prods) => (this.products = prods));

    // carrega do localStorage
    const cfg = this.storage.getItem('homeConfig') as Array<{
      productId: number;
      overlayText: string;
    }>;
    if (Array.isArray(cfg)) {
      cfg.forEach((slot) => {
        this.slots.push(
          this.fb.group({
            productId: [slot.productId, Validators.required],
            overlayText: [slot.overlayText, Validators.required],
          })
        );
      });
    } else {
      // se não existir, crio 3 vazios por padrão
      for (let i = 0; i < 3; i++) this.addSlot();
    }
  }

  loadConfig(): void {
    // TODO: Fetch existing configuration
    // Example:
    // this.configService.getHomeConfig().subscribe(configs => {
    //   configs.forEach(c => this.slots.push(this.createSlot(c.productId, c.overlayText)));
    // });
  }

  createSlot(
    productId: number | null = null,
    overlayText: string = ''
  ): FormGroup {
    return this.fb.group({
      productId: [productId, Validators.required],
      overlayText: [overlayText, Validators.required],
    });
  }

  addSlot() {
    this.slots.push(
      this.fb.group({
        productId: [null, Validators.required],
        overlayText: ['', Validators.required],
      })
    );
  }

  removeSlot(i: number) {
    this.slots.removeAt(i);
  }

  onSave() {
    if (this.form.invalid) return;

    // salva no localStorage
    this.storage.setItem('homeConfig', this.slots.value);

    // exibe snackbar de sucesso
    this.snackBar.openFromComponent(CustomSnackBarComponent, {
      data: { message: 'Configurações salvas com sucesso!', type: 'success' },
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
