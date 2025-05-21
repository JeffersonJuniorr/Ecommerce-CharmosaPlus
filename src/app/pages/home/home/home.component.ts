import { Component, OnInit, OnDestroy, NgZone, PLATFORM_ID, Inject} from '@angular/core';
import { CommonModule, isPlatformBrowser as commonIsPlatformBrowser} from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_DATA } from './mock-data.component';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage/storage.service';
import { CartService } from '../../../services/cartservice/cartservice.service';
import { ProductService, Product } from '../../../services/products/products.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  banners = MOCK_DATA.banners;
  products: Product[] = [];
  offerBanner = MOCK_DATA.offers.banner;
  categories = MOCK_DATA.categories;
  cardsproducts: Product[] = [];
  isBrowser: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;
  productImages: string[] = [];

  currentIndex = 0;
  autoPlayInterval: any;

  // Propriedades para o modal de detalhes do produto
  showProductModal: boolean = false;
  selectedProduct: Product | null = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  selectedQuantity: number = 1;
  selectedImageUrl: string = '';

  // Carrinho (array local que será salvo no StorageService)
  cart: any[] = [];

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private storageService: StorageService,
    private cartService: CartService,
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object
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
      this.loadProducts();
    }
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.cardsproducts = products
          .filter((product) => product.active === true)
          .slice(0, 8);
        this.loadProductImages();

        this.isLoading = false;
      },
      // error: (err) => {
      //   console.error('Erro ao carregar os produtos:', err);
      //   this.error = 'Falha ao carregar os produtos. Tente novamente mais tarde..';
      //   this.isLoading = false;

      //   // Fallback to mock data if API fails
      //   this.products = this.mapMockDataToProducts(MOCK_DATA.products);
      //   this.cardsproducts = this.mapMockDataToProducts(MOCK_DATA.cardsproducts);
      // }
    });
  }

  // loadProductImages(): void {
  //   this.products.forEach(product => {
  //     if (product.id) {
  //       this.productService.getProductImage(product.id).subscribe({
  //         next: (blob) => {
  //           // Crie uma URL para o blob
  //           const objectUrl = URL.createObjectURL(blob);
  //           // Atribuir ao produto (usando uma matriz para manter a estrutura)
  //           product.imageUrls = [objectUrl];
  //         },
  //         error: (err) => {
  //           console.error(`Error loading image for product ${product.id}:`, err);
  //           product.imageUrls = ['assets/products/banner1.jpg'];
  //         }
  //       });
  //     }
  //   });
  // }

  
loadProductImages(): void {
  this.products.forEach(product => {
    this.productService.getProductImagesBase64(product.id).subscribe({
      next: (base64List) => {
        // prefixa cada string com o data URI
        product.imageUrls = base64List.map(b64 => `data:image/jpeg;base64,${b64}`);
      },
      error: () => {
        // se não tiver imagem, deixa o array vazio (para não quebrar o *ngFor)
        product.imageUrls = [];
        console.warn(`Sem imagem para produto ${product.id}`);
      }
    });
  });
}

  // getProductImageUrl(product: Product): string {
  //   if (product.id) {
  //     const token = this.storageService.getItem('authToken');
  //     return `${environment.apiUrl}/products/${product.id}/images?imageId=${product.id}&token=${token}`;
  //   }
  //   return 'assets/products/banner1.jpg';
  // }

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
      }, 8000);
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

  goToCheckout(productId: number | undefined): void {
    if (productId) {
      this.router.navigate(['/checkout', productId]);
    }
  }

  getCategory(index: number): string {
    return this.categories[index % this.categories.length];
  }

  // Métodos para o modal de detalhes do produto
  openProductModal(product: Product): void {
    this.selectedProduct = product;
    this.selectedQuantity = 1;
    this.selectedSize = product.sizes?.[0] || '';
    this.selectedColor = product.colors?.[0] || '';

    if (!product.id) {
      this.selectedImageUrl = '';
      this.showProductModal = true;
      return;
    }

  // Usa o Base64
  this.productService.getProductImagesBase64(product.id).subscribe({
    next: (base64List) => {
      // salva todas as URLs no componente
      this.productImages = base64List.map(b64 => `data:image/jpeg;base64,${b64}`);
      this.selectedImageUrl = this.productImages[0] || '';
      this.showProductModal = true;
    },
    error: () => {
      this.productImages = [];
      this.selectedImageUrl = '';
      this.showProductModal = true;
    },
  });
}

  closeProductModal(): void {
    if (this.selectedImageUrl && this.selectedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedImageUrl);
    }

    this.showProductModal = false;
    this.selectedProduct = null;
    this.selectedImage = '';
    this.selectedSize = '';
    this.selectedColor = '';
    this.selectedQuantity = 1;
  }

  changeColor(color: string): void {
    this.selectedColor = color;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  addToCart(quantity: number = 1): void {
    if (!this.selectedProduct) return;

    const productImage = typeof this.selectedImage === 'string' ? this.selectedImage : 
    (this.selectedProduct.imageUrls && this.selectedProduct.imageUrls[0]) || null;

    const cartItem = {
      id: this.selectedProduct.id,
      name: this.selectedProduct.name,
      price: this.selectedProduct.price,
      image: productImage,
      selectedSize: this.selectedSize,
      selectedColor: this.selectedColor,
      quantity: quantity,
    };

     console.log('Item sendo adicionado:', cartItem);

    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        this.closeProductModal();
        this.showSuccessAlert('Produto adicionado ao carrinho!');
      },
      error: (err) => {
        console.error('Erro ao adicionar ao carrinho:', err);
        this.showErrorAlert(
          err.message || 'Erro ao adicionar produto ao carrinho'
        );
      },
    });
  }

  private showSuccessAlert(message: string): void {
    // Implementar lógica de exibição de alerta/mensagem
    alert(message);
  }

  private showErrorAlert(message: string): void {
    // Implementar lógica de exibição de alerta/mensagem
    alert('Erro: ' + message);
  }
}
