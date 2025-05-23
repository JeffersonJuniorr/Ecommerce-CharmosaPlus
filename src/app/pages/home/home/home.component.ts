import { Component, OnInit, OnDestroy, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser as commonIsPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_DATA } from './mock-data.component';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage/storage.service';
import { CartService } from '../../../services/cartservice/cartservice.service';
import { ProductService, Product } from '../../../services/products/products.service';
import { SafeUrl } from '@angular/platform-browser';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
  // cardsproducts: Product[] = [];
  cardsproducts: {
    id: number;
    name: string;
    images: (string | SafeUrl)[];
    overlayText: string;
  }[] = [];
  private autoPlayId?: number;
  private cartSub?: Subscription;

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
    this.isBrowser = commonIsPlatformBrowser(platformId);
    // if (this.isBrowser) {
    //   this.loadCart();
    //   window.addEventListener('cartUpdated', this.loadCart.bind(this));
    // }
  }

  // ngOnDestroy(): void {
  //   this.stopAutoPlay();
  //   if (this.isBrowser) {
  //     window.removeEventListener('cartUpdated', this.loadCart.bind(this));
  //   }
  // }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.loadMenuConfig();
    this.startAutoPlay();
    // this.loadAll();
  }

  ngOnDestroy() {
    if (this.autoPlayId != null) {
      clearInterval(this.autoPlayId);
    }
  }

  private loadMenuConfig() {
    this.isLoading = true;
    this.productService
      .getProducts()
      .pipe(
        switchMap((products) => {
          this.products = products;
          const calls = products.map((p) =>
            this.productService.getProductImagesBase64(p.id).pipe(
              map((b64s) => ({
                id: p.id,
                images: b64s.map((b) => `data:image/jpeg;base64,${b}`),
              })),
              catchError(() => of({ id: p.id, images: [] }))
            )
          );
          return forkJoin(calls);
        })
      )
      .subscribe((allImages) => {
        // Atribui imageUrls aos products
        allImages.forEach((slot) => {
          const p = this.products.find((x) => x.id === slot.id);
          if (p) p.imageUrls = slot.images;
        });

        // Monta os cards com config do localStorage ou fallback
        this.buildCards();
        this.isLoading = false;
      });
  }

  // private loadAll() {
  //   this.isLoading = true;

  //   // 1) buscar produtos
  //   this.productService
  //     .getProducts()
  //     .pipe(
  //       // 2) para cada produto, buscar as imagens em base64
  //       switchMap((products) => {
  //         this.products = products;
  //         const calls = products.map((p) =>
  //           this.productService.getProductImagesBase64(p.id).pipe(
  //             map((list) => ({
  //               id: p.id,
  //               images: list.map((b64) => `data:image/jpeg;base64,${b64}`),
  //             })),
  //             catchError(() => of({ id: p.id, images: [] }))
  //           )
  //         );
  //         return forkJoin(calls);
  //       })
  //     )
  //     .subscribe((allImages) => {
  //       // 3) colocar as imageUrls em cada product
  //       allImages.forEach((slot) => {
  //         const p = this.products.find((x) => x.id === slot.id);
  //         if (p) p.imageUrls = slot.images;
  //       });

  //       // 4) montar de uma vez os cardsproducts, aplicando homeConfig ou fallback
  //       this.buildCards();
  //       this.isLoading = false;
  //     });
  // }

  private buildCards() {
    const cfgRaw = this.storageService.getItem('homeConfig');
    const cfg = Array.isArray(cfgRaw)
      ? cfgRaw.map((s) => ({
          productId: Number(s.productId),
          overlayText: s.overlayText,
        }))
      : null;

    if (cfg) {
      this.cardsproducts = cfg.map((slot) => {
        const p = this.products.find((x) => x.id === slot.productId);
        return {
          id: slot.productId,
          name: p?.name ?? 'Produto não encontrado',
          images: p?.imageUrls ?? [],
          overlayText: slot.overlayText,
        };
      });
    } else {
      // fallback: primeiros 8 ativos
      this.cardsproducts = this.products
        // .filter(p => p.active)
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          name: p.name,
          images: p.imageUrls || [],
          overlayText: p.name,
        }));
    }
    //debug
    // console.log('MENU SLOTS:', this.cardsproducts);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.cardsproducts = products
          .filter((product) => product.active === true)
          .slice(0, 8)
          .map((product) => ({
            id: product.id,
            name: product.name,
            images: product.imageUrls || [],
            overlayText: product.name, // or any other overlay text logic
          }));
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
  loadProductImages(): void {
    this.products.forEach((product) => {
      this.productService.getProductImagesBase64(product.id).subscribe({
        next: (base64List) => {
          // prefixa cada string com o data URI
          product.imageUrls = base64List.map(
            (b64) => `data:image/jpeg;base64,${b64}`
          );
        },
        error: () => {
          // se não tiver imagem, deixa o array vazio (para não quebrar o *ngFor)
          product.imageUrls = [];
          console.warn(`Sem imagem para produto ${product.id}`);
        },
      });
    });
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

  private startAutoPlay() {
    if (!this.isBrowser) return;
    this.autoPlayId = window.setInterval(() => {
    }, 8000);
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
        this.productImages = base64List.map(
          (b64) => `data:image/jpeg;base64,${b64}`
        );
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

    const productImage =
      typeof this.selectedImage === 'string'
        ? this.selectedImage
        : (this.selectedProduct.imageUrls &&
            this.selectedProduct.imageUrls[0]) ||
          null;

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

  decreaseQuantityModal(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  increaseQuantityModal(): void {
    if (
      this.selectedProduct &&
      this.selectedQuantity < (this.selectedProduct?.quantity ?? Infinity)
    ) {
      this.selectedQuantity++;
    }
  }
}
