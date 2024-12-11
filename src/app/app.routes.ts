import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './pages/home/home/home.component'
import { LoginComponent } from './pages/login/login/login.component';
import { RegisterComponent } from './pages/register/register/register.component'


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
    }
];

// @NgModule({
//     imports: [RouterModule.forRoot(routes)],
//     exports: [RouterModule]
// })

