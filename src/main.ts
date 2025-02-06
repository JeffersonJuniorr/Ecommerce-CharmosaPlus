import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './app/services/products/products.service';
import { ReactiveFormsModule } from '@angular/forms';

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
import { CouponsComponent } from './app//admin/coupons/coupons.component';
import { UsersComponent } from './app/admin/users/users.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // { path: '', redirectTo: 'home', pathMatch: 'full' }, erro na navegação admin - slidebar
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      // { path: '**', redirectTo: '/login', pathMatch: 'full' },
      { path: 'refund-policy', component: RefundPolicyComponent },
      { path: 'abount-us', component: AbountUsComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'checkout/:id', component: CheckoutComponent },
      { path: 'payment', component: PaymentComponent },
      // { path: '**', redirectTo: 'home' },  erro na navegação admin - slidebar
      { 
        path: 'admin-dashboard', 
        component: AdminDashboardComponent, 
        canActivate: [AdminGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          // { path: 'admdashboard', component: AdminDashboardComponent },
          // { path: 'admin-products', component: ProductManagementComponent },
          { path: 'coupons', component: CouponsComponent },
          { path: 'users', component: UsersComponent },
        ],
      },
      { path: 'products-management', component: ProductManagementComponent },
    ]),
    provideHttpClient(),
    ProductService,
    ReactiveFormsModule,
  ],
  
}).catch((err) => console.error(err));;