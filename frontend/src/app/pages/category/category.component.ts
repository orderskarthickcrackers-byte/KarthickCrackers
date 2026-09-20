import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Category, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, LoaderComponent],
  templateUrl: './category.component.html'
})
export class CategoryComponent implements OnInit {
  category?: Category;
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategories: Record<string, boolean> = {};
  isAllSelected: boolean = false;
  allProductsCache: Product[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      cats: this.productService.fetchCategories(),
      prods: this.productService.fetchProducts()
    }).subscribe({
      next: (res) => {
        this.categories = res.cats;
        this.allProductsCache = res.prods;
        
        this.route.paramMap.subscribe(params => {
          const catId = params.get('id');
          if (!catId || catId === 'all') {
            this.selectAllCategories();
          } else {
            this.isAllSelected = false;
            this.selectedCategories = {};
            this.selectedCategories[catId] = true;
            const matchedCat = res.cats.find(c => c.id === catId || c.name.toLowerCase() === catId.toLowerCase());
            if (matchedCat) {
              this.category = matchedCat;
              this.selectedCategories[matchedCat.id] = true;
            }
          }
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        });
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
    this.category = {
      id: 'all',
      name: 'All Fireworks',
      count: 0,
      icon: 'all',
      image: '/assets/images/sparklers.jpg',
      desc: 'Browse our complete collection of genuine Sivakasi fireworks.'
    };
  }

  onAllCategoryToggle(event?: Event): void {
    if (event) {
      event.preventDefault();
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
      event.preventDefault();
      event.stopPropagation();
      (event.target as HTMLElement)?.blur();
    }
    const currentScrollY = window.scrollY;

    const targetCat = this.categories.find(c => c.id === catId);
    const catNameKey = targetCat?.name ? targetCat.name.toLowerCase().replace(/\s+/g, '') : '';

    if (this.isAllSelected) {
      this.isAllSelected = false;
      this.selectedCategories = {};
      this.selectedCategories[catId] = true;
      if (catNameKey) this.selectedCategories[catNameKey] = true;
      if (targetCat) this.category = targetCat;
    } else {
      const isCurrentlySelected = !!this.selectedCategories[catId];
      const newSelected = !isCurrentlySelected;

      this.selectedCategories[catId] = newSelected;
      if (catNameKey) this.selectedCategories[catNameKey] = newSelected;

      const hasAnySelected = this.categories.some(c => !!this.selectedCategories[c.id]);
      if (!hasAnySelected) {
        this.selectAllCategories();
      } else if (targetCat && newSelected) {
        this.category = targetCat;
      }
    }

    this.applyFilters();

    window.scrollTo({ top: currentScrollY, behavior: 'instant' as any });
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as any });
    });
  }

  loadProducts(): void {
    this.productService.fetchProducts().subscribe(prods => {
      this.allProductsCache = prods;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  applyFilters(): void {
    const list = this.allProductsCache.length > 0 ? this.allProductsCache : this.productService.getProducts();

    if (this.isAllSelected) {
      this.products = list;
    } else {
      this.products = list.filter(p => {
        const catIdKey = p.categoryId ? p.categoryId.toString() : '';
        const catNameKey = p.cat ? p.cat.toLowerCase().replace(/\s+/g, '') : '';
        const matchId = catIdKey ? this.selectedCategories[catIdKey] : undefined;
        const matchName = catNameKey ? this.selectedCategories[catNameKey] : undefined;
        return !!(matchId || matchName);
      });
    }
    this.cdr.detectChanges();
  }

  get categoryIconSvg(): SafeHtml {
    if (!this.category) return '';
    const rawSvg = this.productService.ICONS[this.category.icon] || '';
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }

  onDownloadPriceList(): void {
    const title = this.category?.name || 'Category';
    const numId = Number(this.category?.id) || undefined;
    this.productService.exportPriceListCsv(this.products, title, numId);
  }

  get isGiftBoxCategoryOnly(): boolean {
    if (this.isAllSelected) return false;
    const selectedKeys = Object.keys(this.selectedCategories).filter(k => !!this.selectedCategories[k]);
    if (selectedKeys.length > 0) {
      return selectedKeys.every(k => {
        const kLower = k.toLowerCase().replace(/\s+/g, '');
        return kLower === '8' || kLower.includes('gift');
      });
    }
    const name = (this.category?.name || '').toLowerCase();
    const id = (this.category?.id || '').toString();
    return id === '8' || name.includes('gift');
  }

  getGiftBoxEmoji(name: string): string {
    const n = (name || '').toLowerCase();
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
}
