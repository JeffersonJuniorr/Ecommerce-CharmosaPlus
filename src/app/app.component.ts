import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import {  NgModule  } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { HomeComponent } from './pages/home/home/home.component'
import { NavbarComponent } from './components/navbar/navbar/navbar.component'
import { FooterComponent } from "./components/footer/footer/footer.component"

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    HomeComponent,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CharmosaPlus';
}
