import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './pages/home/home/home.component'
import { LoginComponent } from './pages/login/login/login.component';
import { RegisterComponent } from './pages/register/register/register.component'
import { CheckoutComponent } from './pages/checkout/checkout/checkout.component'
import { PaymentComponent } from './pages/payment/payment/payment.component'

import path from 'path'; // ??

export const routes: Routes = [
    {
        path:"",
        pathMatch:"full",
        redirectTo:"home"
    }
    ,
    {
        path:"home", component: HomeComponent
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
        path:"**", redirectTo: 'payment'
    }
    ];

// @NgModule({
//     imports: [RouterModule.forRoot(routes)],
//     exports: [RouterModule]
// })

