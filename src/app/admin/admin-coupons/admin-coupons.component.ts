import { Component, OnInit } from '@angular/core';
import { CouponService, Coupon } from '../../services/coupons/coupon.service';
import { ProductService } from '../../services/products/products.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCouponModalComponent } from '../../components/add-coupon-modal/add-coupon-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-admin-coupons',
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.css',
})
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  isLoading = true;
  errorMessage = '';

  displayedColumns: string[] = [
    'code',
    'type',
    'value',
    'minAmount',
    'product',
    'expiration',
    'uses',
    'actions',
  ];

  constructor(
    private couponService: CouponService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading = true;
    this.couponService.getAllCoupons().subscribe({
      next: (coupons) => {
        this.coupons = coupons;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cupons:', err);
        this.errorMessage =
          'Erro ao carregar cupons. Tente novamente mais tarde.';
        this.isLoading = false;
      },
    });
  }

  openAddCouponModal(): void {
    const dialogRef = this.dialog.open(AddCouponModalComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCoupons();
      }
      // if (result === 'success') {
      //   this.snackBar.open('Cupom criado com sucesso!', 'Fechar', { duration: 3000 });
      //   this.loadCoupons();
      // }
    });
  }

  async deleteCoupon(couponId: number, couponCode: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', // Tamanho pequeno
      data: { couponCode }, // Passa o código do cupom para exibir no modal
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      this.couponService.deleteCoupon(couponId).subscribe({
        next: () => {
          this.showSuccessSnackBar('Cupom excluído com sucesso!');
          this.loadCoupons();
        },
        error: (err) => {
          console.error('Erro ao excluir cupom:', err);
          const errorMessage = err.error?.message || 'Erro ao excluir cupom';
          this.showErrorSnackBar(errorMessage);
        },
      });
    }
  }

  getDiscountType(type: string): string {
    return type === 'PERCENTAGE' ? 'Porcentagem' : 'Valor Fixo';
  }

  private showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
