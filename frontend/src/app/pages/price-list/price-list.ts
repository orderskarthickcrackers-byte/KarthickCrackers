import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { SeoService } from '../../services/seo.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-price-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './price-list.html',
  styleUrl: './price-list.scss'
})
export class PriceList implements OnInit {
  products: Product[] = [];
  isLoading = true;

  constructor(
    private productService: ProductService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateTitle('Sivakasi Crackers Price List 2026 | Karthick Crackers');
    this.seoService.updateMetaDescription('View our complete Sivakasi fireworks price list for 2026. Wholesale rates for sparklers, flower pots, rockets, ground chakkars, and Diwali gift boxes.');
    this.seoService.updateCanonical('https://www.karthickcrackers.in/crackers-price-list');

    this.productService.fetchProducts().subscribe({
      next: (prods) => {
        this.products = prods;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  downloadPdf(): void {
    this.productService.triggerServerPdfDownload();
  }

  formatPrice(val: number): string {
    return this.productService.formatPrice(val);
  }
}
