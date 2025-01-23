import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor(private router: Router) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userRole = localStorage.getItem('userRole');
      const authToken = localStorage.getItem('authToken');

      if (authToken) {
        this.isLoggedIn = true;
        this.isAdmin = userRole === 'admin';
      }
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const navLinks = document.querySelector('.navbar-links') as HTMLElement;
    if (this.isMenuOpen) {
      navLinks.classList.add('active');
    } else {
      navLinks.classList.remove('active');
    }
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
    }

    // Atualiza o status de login
    this.isLoggedIn = false;
    this.isAdmin = false;

    this.router.navigate(['/home']);
  }
}
