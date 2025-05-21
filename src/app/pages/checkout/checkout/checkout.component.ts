import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../../services/products/products.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StorageService } from '../../../services/storage/storage.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  product!: Product;
  mainImageUrl!: SafeUrl;
  thumbnails: SafeUrl[] = [];
  selectedThumbnailIndex = 0;

  // CEP e frete
  cep = '';
  shippingInfo: string | null = null;
  calculating = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private productService: ProductService,
    private storage: StorageService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(productId).subscribe((prod) => {
      this.product = prod;
      if (isPlatformBrowser(this.platformId)) {
        // busca também as imagens em Base64
        this.productService.getProductImagesBase64(productId).subscribe(
          (list) => {
            this.product.imageUrls = list.map(
              (b64) => `data:image/jpeg;base64,${b64}`
            );
            this.setupGallery();
          },
          () => {
            this.product.imageUrls = [];
            this.setupGallery();
          }
        );
      }
    });
  }

  // Em vez de buscar Base64, use o imageUrls do ProductDTO (que já vem em product.imageUrls):
  //  ngOnInit() {
  //   const id = Number(this.route.snapshot.paramMap.get('id'));
  //   this.productService.getProductById(id).subscribe(prod => {
  //     this.product = prod;
  //     // monta URLs completas
  //     const token = this.storage.getItem('authToken');
  //     const base = environment.apiUrl;
  //     if (this.product.imageUrls?.length) {
  //       const full = this.product.imageUrls.map(path =>
  //         `${base}${path}?token=${token}`
  //       );
  //       this.thumbnails = [...full];
  //       this.mainImageUrl = full[0];
  //       this.selectedThumbnailIndex = 0;
  //     }
  //   });
  // }

  private setupGallery() {
    // se tiver imagens, define principal + miniaturas
    if (this.product.imageUrls?.length) {
      this.mainImageUrl = this.product.imageUrls[0];
      // mantém sempre todas as outras como thumbs
      this.thumbnails = [...this.product.imageUrls];
      this.selectedThumbnailIndex = 0;
    } else {
      this.mainImageUrl = '';
      this.thumbnails = [];
    }
  }

  selectThumbnail(idx: number) {
    this.selectedThumbnailIndex = idx;
    this.mainImageUrl = this.thumbnails[idx];
  }

  calculateShipping() {
    this.shippingInfo = null;
    const cleanCep = this.cep.replace(/\D/g, '');
    if (!/^\d{8}$/.test(cleanCep)) {
      this.shippingInfo = 'CEP inválido';
      return;
    }

    this.calculating = true;
    this.http
      .get<{ state: string }>(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`)
      .pipe(
        timeout(5000), // aborta se passar de 5s
        catchError((err) => {
          this.shippingInfo = 'Não foi possível calcular frete';
          this.calculating = false;
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        const zone = this.mapStateToZone(res.state);
        const { price, days } = this.zoneTable[zone];
        this.shippingInfo = `R$ ${price.toFixed(
          2
        )} • prazo de ${days} dias úteis`;
        this.calculating = false;
      });
  }

  /** Tabela de zonas por região */
  private zoneTable: Record<string, { price: number; days: number }> = {
    Norte: { price: 30.0, days: 12 },
    Nordeste: { price: 25.0, days: 10 },
    Centro_Oeste: { price: 20.0, days: 8 },
    Sudeste: { price: 15.0, days: 5 },
    Sul: { price: 12.0, days: 4 },
  };

  /** Agrupa cada estado na sua zona */
  private mapStateToZone(uf: string): string {
    if (['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'].includes(uf)) return 'Norte';
    if (['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'].includes(uf))
      return 'Nordeste';
    if (['DF', 'GO', 'MT', 'MS'].includes(uf)) return 'Centro_Oeste';
    if (['ES', 'MG', 'RJ', 'SP'].includes(uf)) return 'Sudeste';
    if (['PR', 'RS', 'SC'].includes(uf)) return 'Sul';
    return 'Sudeste';
  }
}
