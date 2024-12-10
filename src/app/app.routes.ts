import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './pages/home/home/home.component'
import { LoginComponent } from './pages/login/login/login.component';



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
    }
];

// @NgModule({
//     imports: [RouterModule.forRoot(routes)],
//     exports: [RouterModule]
// })

