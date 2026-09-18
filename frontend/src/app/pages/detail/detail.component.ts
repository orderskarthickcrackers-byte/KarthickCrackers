import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { PaymentSettingsService } from '../../services/payment-settings.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  product?: Product;
  quantity: number = 1;
  relatedProducts: Product[] = [];
  specsEntries: { key: string; value: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    public paymentSettingsService: PaymentSettingsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const code = params.get('code') || '';
      this.loadProduct(code);
    });
  }

  loadProduct(code: string): void {
    this.quantity = 1;
    this.productService.fetchProducts().subscribe(all => {
      let found = all.find(x => x.code.toLowerCase() === code.toLowerCase() || x.code === code);
      if (!found && code) {
        // Try partial code match (e.g. KHC-1002 vs 1002)
        found = all.find(x => x.code.toLowerCase().includes(code.toLowerCase()));
      }
      if (!found && all.length > 0) {
        found = all[0];
      }
      this.product = found;

      if (this.product) {
        if (this.product.specs) {
          this.specsEntries = Object.entries(this.product.specs).map(([key, value]) => ({ key, value }));
        } else {
          this.specsEntries = [
            { key: 'Product Code', value: this.product.code },
            { key: 'Category', value: this.product.categoryName || 'Fireworks' },
            { key: 'Unit', value: this.product.unit || '1 Box' },
            { key: 'Stock Quantity', value: `${this.product.totalQuantity || 50} Pcs Available` }
          ];
        }

        const related = all.filter((x: Product) => x.code !== this.product?.code).slice(0, 4);
        this.relatedProducts = related;
      }
      this.cdr.detectChanges();
    });
  }

  get categoryIconSvg(): SafeHtml {
    if (!this.product) return '';
    const rawSvg = this.productService.getCategoryIcon(this.product.cat);
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }

  get formattedPrice(): string {
    return this.product ? this.productService.formatPrice(this.product.discountPrice || this.product.price) : '';
  }

  get formattedMrp(): string {
    return this.product ? this.productService.formatPrice(this.product.mrpPrice || this.product.price) : '';
  }

  get hasDiscount(): boolean {
    return !!(this.product && this.product.mrpPrice && this.product.mrpPrice > (this.product.discountPrice || this.product.price));
  }

  get formattedUnit(): string {
    if (!this.product) return 'units';
    return this.product.unit.replace(/^(pack of \d+|per |combo )/, '') || 'units';
  }

  increaseQty(): void {
    this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.code, this.quantity);
    }
  }
}
