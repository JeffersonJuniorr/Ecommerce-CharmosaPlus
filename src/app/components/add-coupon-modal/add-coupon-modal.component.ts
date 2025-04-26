import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CouponService } from '../../services/coupons/coupon.service';
import { ProductService } from '../../services/products/products.service';
import { Product } from '../../services/products/products.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-add-coupon-modal',
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatInputModule,
  ],
  templateUrl: './add-coupon-modal.component.html',
  styleUrls: ['./add-coupon-modal.component.css'],
})
export class AddCouponModalComponent implements OnInit {
  couponForm: FormGroup;
  activeSection: string = 'general';
  // products: any[] = [];
  isGeneratingCode = false;
  showAdvanced: boolean = false;

  productSearchControl = new FormControl();
  filteredProducts!: Observable<any[]>;

  productSearchControlExcluded = new FormControl();
  filteredProductsExcluded!: Observable<any[]>;

  allProducts: any[] = [];

  discountTypes = [
    { value: 'percentage', label: 'Desconto em porcentagem' },
    // { value: 'fixed_cart', label: 'Desconto fixo de carrinho' }, missing in the backend?
    { value: 'fixed_product', label: 'Desconto fixo de produto' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCouponModalComponent>,
    private couponService: CouponService,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      description: [''],
      discountType: ['FIXED', Validators.required],
      discountValue: ['', [Validators.required, Validators.min(0)]],
      minimumAmountToApply: [''],
      individualUseOnly: [false],
      freeShipping: [false],
      maxUses: [''],
      productId: [null],
      expirationDate: [''],
    });

    this.loadProducts();
    // this.setupProductSearch();
  }
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      this.allProducts = products;
      this.setupProductSearch();
    });
  }

  setupProductSearch(): void {
    this.filteredProducts = this.productSearchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterProducts(value))
    );

    this.filteredProductsExcluded =
      this.productSearchControlExcluded.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterProducts(value))
      );
  }

  private _filterProducts(value: string | any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.allProducts.filter((product) =>
      product.name.toLowerCase().includes(filterValue)
    );
  }

  displayProductName(product: any): string {
    return product?.name || '';
  }

  getProductName(productId: number): string {
    const product = this.allProducts.find((p) => p.id === productId);
    return product ? product.name : '';
  }

  addSelectedProduct(product: any, controlName: string): void {
    const currentValues = this.couponForm.get(controlName)?.value || [];
    if (!currentValues.includes(product.id)) {
      this.couponForm
        .get(controlName)
        ?.patchValue([...currentValues, product.id]);
    }
    if (controlName === 'productIds') {
      this.productSearchControl.reset();
    } else {
      this.productSearchControlExcluded.reset();
    }
  }

  removeProduct(productId: number, controlName: string): void {
    const currentValues = this.couponForm.get(controlName)?.value || [];
    this.couponForm
      .get(controlName)
      ?.patchValue(currentValues.filter((id: number) => id !== productId));
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  generateCode(): void {
    this.isGeneratingCode = true;
    this.couponService.generateCouponCode().subscribe({
      next: (response) => {
        this.couponForm.patchValue({ code: response.code });
        this.isGeneratingCode = false;
      },
      error: (err) => {
        console.error('Erro ao gerar código:', err);
        this.isGeneratingCode = false;
        this.showErrorSnackBar('Erro ao gerar código do cupom');
      },
    });
  }

  onSubmit(): void {
    if (this.couponForm.invalid) {
      this.showErrorSnackBar(
        'Preencha todos os campos obrigatórios corretamente'
      );
      return;
    }

    const formValue = this.couponForm.value;
    const couponData = {
      ...formValue,
      minimumAmountToApply: formValue.minimumAmountToApply || null,
      maxUses: formValue.maxUses || null,
      productId: formValue.productId || null,
    };

    this.couponService.createCoupon(couponData).subscribe({
      next: (newCoupon) => {
        this.dialogRef.close(newCoupon);
        this.showSuccessSnackBar('Cupom criado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao criar cupom:', err);
        const errorMessage = err.error?.message || 'Erro ao criar cupom';
        this.showErrorSnackBar(errorMessage);
      },
    });
  }

  private showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 1500,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 1500,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
