import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen: boolean = false;
 
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const navLinks = document.querySelector('.navbar-links') as HTMLElement;
    if (this.isMenuOpen) {
      navLinks.classList.add('active');
    } else {
      navLinks.classList.remove('active');
    }
  }
}
