import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login/login.component';

export const routes: Routes = [
    {
        path:"",
        pathMatch:"full",
        redirectTo:"login"
    }
    ,
    {
        path:"login", component: LoginComponent
    },
    {
        path:"", component: LoginComponent
    }
];
