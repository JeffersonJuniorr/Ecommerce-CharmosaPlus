import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CouponService, Coupon } from '../../services/coupons/coupon.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-coupons',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.css'
}) 
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  newCoupon: Coupon = {
    code: '',
    discount: 0,
    expirationDate: '',
    isActive: true
  };

  constructor(private couponService: CouponService) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.couponService.getCoupons().subscribe(
      (data: Coupon[]) => {
        this.coupons = data;
      },
      (error) => console.error('Erro ao carregar cupons:', error)
    );
  }

  addCoupon() {
    if (!this.newCoupon.code || this.newCoupon.discount <= 0) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    this.couponService.addCoupon(this.newCoupon).subscribe(() => {
      this.loadCoupons();
      this.newCoupon = { code: '', discount: 0, expirationDate: '', isActive: true };
    });
  }

  deleteCoupon(id: number) {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      this.couponService.deleteCoupon(id).subscribe(() => {
        this.coupons = this.coupons.filter(coupon => coupon.id !== id);
      });
    }
  }
}
