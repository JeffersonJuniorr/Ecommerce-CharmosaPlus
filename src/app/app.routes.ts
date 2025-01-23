import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './pages/home/home/home.component'
import { LoginComponent } from './pages/login/login/login.component';
import { RegisterComponent } from './pages/register/register/register.component'
import { CheckoutComponent } from './pages/checkout/checkout/checkout.component'
import { PaymentComponent } from './pages/payment/payment/payment.component'
import { AbountUsComponent } from './pages/abount-us/abount-us/abount-us.component'
import { FaqComponent } from './pages/faq/faq/faq.component'
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy/refund-policy.component'

import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { ProductsComponent } from './admin/products/products.component';
import { StatsComponent } from './admin/stats/stats.component';
import { OrdersComponent } from './admin/orders/orders.component';

import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path:"",
        pathMatch:"full",
        redirectTo:"home"
    }
    ,
    {
        path:"", component: HomeComponent
    },
    {
        path:"login", component: LoginComponent
    },
    {
        path:"register", component: RegisterComponent
    },
    {
        path:"checkout", component: CheckoutComponent
    },
    {
        path:"payment", component: PaymentComponent
    },
    {
        path:"abount-us", component: AbountUsComponent
    },
    {
        path:"faq", component: FaqComponent
    },
    {
        path:"refund-policy", component: RefundPolicyComponent
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AdminGuard],
        children: [
          { path: 'users', component: UsersComponent },
          { path: 'products', component: ProductsComponent },
          { path: 'stats', component: StatsComponent },
          { path: 'orders', component: OrdersComponent },
        ],
      },
    ];