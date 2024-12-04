import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {  NgModule  } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CharmosaPlus';
}
