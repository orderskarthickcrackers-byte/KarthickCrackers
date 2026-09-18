import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  constructor(
    public cartService: CartService,
    private productService: ProductService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.productService.fetchProducts().subscribe();
  }

  getProduct(code: string): Product | undefined {
    return this.productService.getProductByCode(code);
  }

  getCategoryIconSvg(catId: string): SafeHtml {
    const rawSvg = this.productService.getCategoryIcon(catId);
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  onIncreaseQty(code: string, currentQty: number): void {
    this.cartService.setQty(code, currentQty + 1);
  }

  onDecreaseQty(code: string, currentQty: number): void {
    if (currentQty > 1) {
      this.cartService.setQty(code, currentQty - 1);
    }
  }

  onRemove(code: string): void {
    this.cartService.removeFromCart(code);
  }
}
