import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ProductService } from './app/services/products/products.service';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

import { HomeComponent } from './app/pages/home/home/home.component';
import { LoginComponent } from './app/pages/login/login/login.component';
import { RegisterComponent } from './app/pages/register/register/register.component';
import { RefundPolicyComponent } from './app/pages/refund-policy/refund-policy/refund-policy.component';
import { AbountUsComponent } from './app/pages/abount-us/abount-us/abount-us.component';
import { FaqComponent } from './app/pages/faq/faq/faq.component';
import { CheckoutComponent } from './app/pages/checkout/checkout/checkout.component';
import { PaymentComponent } from './app/pages/payment/payment/payment.component';

import { AdminDashboardComponent } from './app/admin/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './app/guards/admin.guard';
import { ProductManagementComponent } from './app/admin/products/productmanagement/product-management.component';
import { AdminCouponsComponent } from './app/admin/admin-coupons/admin-coupons.component';
import { UsersComponent } from './app/admin/users/users.component';
import { AdminPagesComponent } from './app/admin/adm-pages/admin-pages.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ExtractAdminComponent } from './app/admin/admin-extract/extract-admin.component';
import { ListProductsComponent } from './app/admin/products/list-products/list-products.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent, data: { hideCategories: true } },
      { path: 'register', component: RegisterComponent, data: { hideCategories: true } },
      { path: 'refund-policy', component: RefundPolicyComponent, data: { hideCategories: true } },
      { path: 'abount-us', component: AbountUsComponent, data: { hideCategories: true } },
      { path: 'faq', component: FaqComponent, data: { hideCategories: true } },
      { path: 'checkout/:id', component: CheckoutComponent, data: { hideCategories: true } },
      { path: 'payment', component: PaymentComponent, data: { hideCategories: true } },

      { path: 'admin-dashboard', component: AdminDashboardComponent, data: { hideCategories: true } },
      { path: 'admin-coupons', component: AdminCouponsComponent, data: { hideCategories: true } },
      { path: 'products-management', component: ProductManagementComponent, data: { hideCategories: true } },
      { path: 'admin-pages', component: AdminPagesComponent, data: { hideCategories: true } },
      { path: 'admin-extract', component: ExtractAdminComponent, data: { hideCategories: true }},
      { path: 'list-products', component: ListProductsComponent, data: { hideCategories: true } },
    ]),
    provideHttpClient(withFetch()),
    ProductService,
    importProvidersFrom(ReactiveFormsModule),
    importProvidersFrom(BrowserAnimationsModule),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
