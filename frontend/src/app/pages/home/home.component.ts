import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { PaymentSettingsService } from '../../services/payment-settings.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CategoryTileComponent } from '../../components/category-tile/category-tile.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, CategoryTileComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  isBurstPlaying = false;

  constructor(
    private productService: ProductService,
    public paymentSettingsService: PaymentSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.fetchCategories().subscribe(cats => {
      this.categories = cats;
      this.cdr.detectChanges();
    });

    this.productService.fetchProducts().subscribe(prods => {
      this.featuredProducts = prods.slice(0, 8);
      this.cdr.detectChanges();
    });
    
    setTimeout(() => {
      this.isBurstPlaying = true;
      this.cdr.detectChanges();
    }, 200);
  }

  onDownloadPriceList(): void {
    // Triggers direct server PDF download for the entire master price list
    this.productService.triggerServerPdfDownload();
  }
}
