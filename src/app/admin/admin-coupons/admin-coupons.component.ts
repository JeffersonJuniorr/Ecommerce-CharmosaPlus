import { Component, OnInit } from '@angular/core';
import { CouponService, Coupon } from '../../services/coupons/coupon.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCouponModalComponent } from '../../components/add-coupon-modal/add-coupon-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    CommonModule,
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
    });
  }

  async deleteCoupon(couponId: number, couponCode: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { couponCode },
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
