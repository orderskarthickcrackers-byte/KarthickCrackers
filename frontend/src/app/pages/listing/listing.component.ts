import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Category, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { SeoService } from '../../services/seo.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, LoaderComponent],
  templateUrl: './listing.component.html'
})
export class ListingComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategories: Record<string, boolean> = {};
  isAllSelected: boolean = true;
  maxPrice: number = 10000;
  sortOption: string = 'popular';
  totalProductsCount: number = 0;
  allProductsCache: Product[] = [];
  isLoading = true;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateTitle('Shop All Fireworks | Karthick Crackers');
    this.seoService.updateMetaDescription('Browse our complete collection of authentic Sivakasi crackers, sparklers, rockets, and Diwali gift boxes. Best prices and direct factory delivery.');
    this.seoService.updateCanonical('https://www.karthickcrackers.in/products');

    forkJoin({
      cats: this.productService.fetchCategories(),
      prods: this.productService.fetchProducts()
    }).subscribe({
      next: (res) => {
        this.categories = res.cats;
        this.allProductsCache = res.prods;
        this.totalProductsCount = res.prods.length;
        
        this.selectAllCategories();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectAllCategories(): void {
    this.isAllSelected = true;
    this.selectedCategories = {};
  }

  onAllCategoryToggle(event?: Event): void {
    if (event) {
      event.stopPropagation();
      (event.target as HTMLElement)?.blur();
    }
    const currentScrollY = window.scrollY;

    this.selectAllCategories();
    this.applyFilters();

    window.scrollTo({ top: currentScrollY, behavior: 'instant' as any });
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as any });
    });
  }

  onCategoryToggle(catId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      (event.target as HTMLElement)?.blur();
    }
    const currentScrollY = window.scrollY;

    const targetCat = this.categories.find(c => c.id === catId);
    const catNameKey = targetCat?.name ? targetCat.name.toLowerCase().replace(/\s+/g, '') : '';

    if (this.isAllSelected) {
      // Transition from "All Categories" to picking specific category
      this.isAllSelected = false;
      this.selectedCategories = {};
      this.selectedCategories[catId] = true;
      if (catNameKey) this.selectedCategories[catNameKey] = true;
    } else {
      // Toggle current category
      const isCurrentlySelected = !!this.selectedCategories[catId];
      const newSelected = !isCurrentlySelected;

      this.selectedCategories[catId] = newSelected;
      if (catNameKey) this.selectedCategories[catNameKey] = newSelected;

      // If user deselects category and no other category remains selected, default back to All Categories
      const hasAnySelected = this.categories.some(c => !!this.selectedCategories[c.id]);
      if (!hasAnySelected) {
        this.selectAllCategories();
      }
    }

    this.applyFilters();

    window.scrollTo({ top: currentScrollY, behavior: 'instant' as any });
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as any });
    });
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const list = this.allProductsCache.length > 0 ? this.allProductsCache : this.productService.getProducts();

    let result = list.filter((p: Product) => {
      let catMatch = true;
      if (!this.isAllSelected) {
        const catIdKey = p.categoryId ? p.categoryId.toString() : '';
        const catNameKey = p.cat ? p.cat.toLowerCase().replace(/\s+/g, '') : '';

        const matchId = catIdKey ? this.selectedCategories[catIdKey] : undefined;
        const matchName = catNameKey ? this.selectedCategories[catNameKey] : undefined;

        catMatch = !!(matchId || matchName);
      }
      const priceMatch = p.price <= this.maxPrice || this.maxPrice >= 10000;
      return catMatch && priceMatch;
    });

    if (this.sortOption === 'price-asc') {
      result.sort((a: Product, b: Product) => a.price - b.price);
    } else if (this.sortOption === 'price-desc') {
      result.sort((a: Product, b: Product) => b.price - a.price);
    } else if (this.sortOption === 'name') {
      result.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
    }

    this.products = result;
    this.cdr.detectChanges();
  }

  formatPrice(val: number): string {
    return this.productService.formatPrice(val);
  }

  onDownloadPriceList(): void {
    this.productService.exportPriceListCsv(this.products, 'All_Fireworks');
  }
}
