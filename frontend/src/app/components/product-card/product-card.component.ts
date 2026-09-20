import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  get categoryIconSvg(): SafeHtml {
    const rawSvg = this.productService.getCategoryIcon(this.product.cat);
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }

  get formattedPrice(): string {
    return this.productService.formatPrice(this.product.discountPrice || this.product.price);
  }

  get formattedMrp(): string {
    return this.productService.formatPrice(this.product.mrpPrice || this.product.price);
  }

  get hasDiscount(): boolean {
    return !!(this.product.mrpPrice && this.product.mrpPrice > (this.product.discountPrice || this.product.price));
  }

  get discountBadgeText(): string {
    if (this.product.discountPercentage && this.product.discountPercentage > 0) {
      return `${this.product.discountPercentage}% OFF`;
    }
    return this.product.badge || '';
  }

  get isGiftBox(): boolean {
    const catName = (this.product.categoryName || this.product.cat || '').toLowerCase();
    return this.product.categoryId === 8 || catName.includes('gift');
  }

  get giftBoxEmoji(): string {
    const n = (this.product.name || '').toLowerCase();
    if (n.includes('zumba')) return '🎁';
    if (n.includes('super star')) return '⭐';
    if (n.includes('peacock')) return '🦚';
    if (n.includes('samba')) return '💃';
    if (n.includes('kuchipudi')) return '🎭';
    if (n.includes('rhythm')) return '🎵';
    if (n.includes('belley') || n.includes('belly')) return '🌟';
    if (n.includes('kaithakali') || n.includes('kathakali')) return '👺';
    if (n.includes('dragon')) return '🐉';
    return '🎁';
  }

  get currentQty(): number {
    return this.cartService.getItemQty(this.product.code);
  }

  onQuickAdd(event: MouseEvent): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product.code, 1);
  }

  onIncrement(event: MouseEvent): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product.code, 1);
  }

  onDecrement(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentQty > 0) {
      this.cartService.decrementQty(this.product.code);
    }
  }

  navigateToDetail(): void {
    this.router.navigate(['/products', this.product.productSlug || this.product.code]);
  }

  onImgError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = '/assets/images/sparklers.jpg';
    }
  }
}

