import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

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
import { ProductsComponent } from './app/admin/products/products.component';
import { OrdersComponent } from './app/admin/orders/orders.component';
import { UsersComponent } from './app/admin/users/users.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '**', redirectTo: '/login', pathMatch: 'full' },
      { path: 'refund-policy', component: RefundPolicyComponent },
      { path: 'abount-us', component: AbountUsComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'checkout/:id', component: CheckoutComponent },
      { path: 'payment', component: PaymentComponent },
      { path: '**', redirectTo: 'home' },
      { 
        path: 'admin-dashboard', 
        component: AdminDashboardComponent, 
        canActivate: [AdminGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'admin-products', component: ProductsComponent },
          { path: 'admin-orders', component: OrdersComponent },
          { path: 'admin-users', component: UsersComponent },
        ],
      },
    ]),
    provideHttpClient(),
  ],
});