import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { PaymentSettingsService } from '../../services/payment-settings.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CategoryTileComponent } from '../../components/category-tile/category-tile.component';
import { LoaderComponent } from '../../components/loader/loader.component';
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
