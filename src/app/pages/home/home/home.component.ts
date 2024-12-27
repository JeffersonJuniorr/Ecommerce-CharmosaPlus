import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  products = [
    {
      id: 1,
      name: 'Macaquinho Duna',
      price: 139.00,
      image: 'assets/products/banner3.jpg',
      sizes: ['G1', 'G2'], // Tamanhos disponíveis
      colors: ['#D0C6BC', '#808080', '#000'] // Cores em formato hexadecimal
    },
    {
      id: 1,
      name: 'Conjunto Alfaiataria',
      price: 169.00,
      image: 'assets/products/banner1.jpg',
      sizes: ['G1', 'G2'],
      colors: ['#FFD70080', '#808080', '#000']
    },
    {
      id: 1,
      name: 'Vestido Nula Manga',
      price: 119.00,
      image: 'assets/products/banner2.jpg',
      sizes: ['G1', 'G2'],
      colors: ['#FFD70080', '#808080', '#000']
    }
  ];
  constructor(private router: Router) {}

  goToCheckout(productId: number): void {
    this.router.navigate(['/checkout', productId]);
  }
}
