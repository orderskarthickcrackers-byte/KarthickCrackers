import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Category, Product } from '../../models/product.model';
import { LoaderComponent } from '../../components/loader/loader.component';
import { SeoService } from '../../services/seo.service';

export interface GroupedCategory {
  id: string;
  name: string;
  products: Product[];
}

@Component({
  selector: 'app-quick-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoaderComponent],
  templateUrl: './quick-order.component.html',
  styleUrls: ['./quick-order.component.scss']
})
export class QuickOrderComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(true);
  
  searchQuery = signal<string>('');
  selectedCatId = signal<string>('all');
  onlySelected = signal<boolean>(false);

  constructor(
    public productService: ProductService,
    public cartService: CartService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateTitle('Quick Order Form | Karthick Crackers');
    this.seoService.updateMetaDescription('Quickly select and order all your Diwali fireworks from Karthick Crackers. Use our fast price list view to easily add items to cart.');
    this.seoService.updateCanonical('https://www.karthickcrackers.in/quick-order');
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        cats: this.productService.fetchCategories(),
        prods: this.productService.fetchProducts()
      }).subscribe({
        next: (res) => {
          this.categories.set(res.cats);
          this.products.set(res.prods);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    });
  }

  // Filtered products list
  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCatId();
    const showOnlySelected = this.onlySelected();
    const allProds = this.products();

    return allProds.filter(p => {
      // Search filter
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q));
      
      // Category filter
      const matchesCat = cat === 'all' || 
        p.categoryId?.toString() === cat || 
        p.cat.toLowerCase() === cat.toLowerCase();

      // Only selected items in cart filter
      const matchesOnlySelected = !showOnlySelected || this.getItemQty(p.code) > 0;

      return matchesSearch && matchesCat && matchesOnlySelected;
    });
  });

  // Group filtered products by Category
  readonly groupedCategoryList = computed<GroupedCategory[]>(() => {
    const prods = this.filteredProducts();
    const map = new Map<string, { id: string; name: string; products: Product[] }>();

    prods.forEach(p => {
      const catName = p.categoryName || p.cat.toUpperCase();
      const catId = p.categoryId?.toString() || p.cat;

      if (!map.has(catName)) {
        map.set(catName, { id: catId, name: catName, products: [] });
      }
      map.get(catName)!.products.push(p);
    });

    return Array.from(map.values());
  });

  // Summary signals
  readonly totalSelectedItemsCount = computed(() => {
    return this.products().filter(p => this.getItemQty(p.code) > 0).length;
  });

  getItemQty(code: string): number {
    return this.cartService.getItemQty(code);
  }

  updateQty(code: string, newQty: number | string): void {
    const qty = Math.max(0, parseInt(newQty.toString(), 10) || 0);
    const current = this.getItemQty(code);

    if (qty <= 0) {
      if (current > 0) {
        this.cartService.removeFromCart(code);
      }
    } else {
      if (current > 0) {
        this.cartService.setQty(code, qty);
      } else {
        this.cartService.addToCart(code, qty);
      }
    }
  }

  incrementQty(code: string): void {
    const current = this.getItemQty(code);
    this.updateQty(code, current + 1);
  }

  decrementQty(code: string): void {
    const current = this.getItemQty(code);
    this.updateQty(code, current - 1);
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  getCategoryIcon(catName: string): string {
    return this.productService.getCategoryIcon(catName);
  }

  scrollToCategory(catId: string): void {
    this.selectedCatId.set(catId);
    if (catId === 'all') {
      this.scrollToTop();
      return;
    }

    setTimeout(() => {
      const el = document.getElementById('cat-sec-' + catId);
      if (el) {
        const yOffset = -135;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetAllQuantities(): void {
    if (confirm('Are you sure you want to clear all items from your cart?')) {
      this.cartService.clearCart();
    }
  }

  downloadPriceListPdf(): void {
    this.productService.triggerServerPdfDownload();
  }
}
