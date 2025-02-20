import { Component, OnInit, OnDestroy, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser as commonIsPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_DATA } from './mock-data.component'; // Ajuste o caminho conforme sua estrutura
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage/storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  banners = MOCK_DATA.banners;
  products = MOCK_DATA.products;
  offerBanner = MOCK_DATA.offers.banner;
  categories = MOCK_DATA.categories;
  cardsproducts = MOCK_DATA.cardsproducts;
  isBrowser: boolean = false;

  currentIndex = 0;
  autoPlayInterval: any;

  // Propriedades para o modal de detalhes do produto
  showProductModal: boolean = false;
  selectedProduct: any = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = ''; // Nova propriedade para a cor selecionada
  selectedQuantity: number = 1;

  // Carrinho (array local que será salvo no StorageService)
  cart: any[] = [];

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = commonIsPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadCart();
      window.addEventListener('cartUpdated', this.loadCart.bind(this));
    }
  }
  ngOnDestroy(): void {
    this.stopAutoPlay();
    if (this.isBrowser) {
      window.removeEventListener('cartUpdated', this.loadCart.bind(this));
    }
  }
  ngOnInit(): void {
    if (this.isBrowser) {
      this.startAutoPlay();
    }
  }

  loadCart() {
    const savedCart = this.storageService.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(JSON.stringify(savedCart));
    } else {
      this.cart = [];
    }
  }

  // Carrossel (banner principal)
  startAutoPlay(): void {
    this.ngZone.runOutsideAngular(() => {
      this.autoPlayInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.nextSlide();
        });
      }, 3000);
    });
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
  }

  prevSlide(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.banners.length) % this.banners.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  goToCheckout(productId: number): void {
    this.router.navigate(['/checkout', productId]);
  }

  getCategory(index: number): string {
    return this.categories[index % this.categories.length];
  }

  // Métodos para o modal de detalhes do produto

  openProductModal(product: any): void {
    this.selectedProduct = product;
    this.selectedImage = product.image; // Imagem padrão
    this.selectedQuantity = 1;
    if (product.sizes && product.sizes.length > 0) {
      this.selectedSize = product.sizes[0];
    } else {
      this.selectedSize = '';
    }
    // Se o produto possuir cores estruturadas como objetos, inicialize selectedColor
    if (
      product.colors &&
      product.colors.length > 0 &&
      typeof product.colors[0] === 'object'
    ) {
      this.selectedColor = product.colors[0].color;
    } else {
      this.selectedColor = '';
    }
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
    this.selectedImage = '';
    this.selectedSize = '';
    this.selectedColor = '';
    this.selectedQuantity = 1;
  }

  changeColor(colorOption: any): void {
    if (typeof colorOption === 'object' && colorOption.image) {
      this.selectedImage = colorOption.image;
      this.selectedColor = colorOption.color;
    } else {
      this.selectedImage = this.selectedProduct.image;
      this.selectedColor = '';
    }
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  addToCart(quantity: number = 1): void {
    if (this.selectedProduct && this.isBrowser) {
      const cartItem = {
        ...this.selectedProduct,
        image: this.selectedImage,
        selectedSize: this.selectedSize,
        selectedColor: this.selectedColor,
        quantity: quantity
      };

      this.cart = this.storageService.getItem('cart') || [];
      
      const existingItem = this.cart.find(item =>
        item.id === cartItem.id &&
        item.selectedSize === cartItem.selectedSize &&
        item.selectedColor === cartItem.selectedColor
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cart.push(cartItem);
      }

      this.storageService.setItem('cart', this.cart);
      window.dispatchEvent(new Event('cartUpdated'));
      this.closeProductModal();
    }
  }
}
