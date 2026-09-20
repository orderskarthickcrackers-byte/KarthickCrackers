import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { PaymentSettingsService } from '../../services/payment-settings.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CategoryTileComponent } from '../../components/category-tile/category-tile.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { SeoService } from '../../services/seo.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, CategoryTileComponent, LoaderComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  isBurstPlaying = false;
  isLoading = true;

  constructor(
    private productService: ProductService,
    public paymentSettingsService: PaymentSettingsService,
    private cdr: ChangeDetectorRef,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateTitle('Karthick Crackers | Sivakasi Crackers & Fireworks');
    this.seoService.updateMetaDescription('Karthick Crackers, Sivakasi – Explore crackers, fireworks, sparklers, flower pots, chakkars, rockets and more. View our latest collection and contact us for enquiries.');
    this.seoService.updateCanonical('https://www.karthickcrackers.in/');
    this.seoService.updateOpenGraphImage('https://www.karthickcrackers.in/assets/images/karthick-crackers-logo.jpg');
    
    this.seoService.addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Karthick Crackers',
      url: 'https://www.karthickcrackers.in/',
      logo: 'https://www.karthickcrackers.in/assets/images/karthick-crackers-logo.jpg',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91 6380891094',
        contactType: 'customer service'
      }
    }, 'org-schema');

    forkJoin({
      cats: this.productService.fetchCategories(),
      prods: this.productService.fetchProducts()
    }).subscribe({
      next: (res) => {
        this.categories = res.cats;
        this.featuredProducts = res.prods.slice(0, 8);
        this.isLoading = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.isBurstPlaying = true;
          this.cdr.detectChanges();
        }, 200);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDownloadPriceList(): void {
    // Triggers direct server PDF download for the entire master price list
    this.productService.triggerServerPdfDownload();
  }
}
