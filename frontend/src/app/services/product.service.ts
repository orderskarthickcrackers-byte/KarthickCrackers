import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { Category, Product } from '../models/product.model';
import { environment } from '../../environments/environment';

export interface ApiProduct {
  productId: number;
  productCode: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  description?: string;
  price: number;
  mrpPrice: number;
  discountPercentage: number;
  discountPrice: number;
  totalQuantity: number;
  unit?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private categoryApiUrl = `${environment.apiUrl}/categories`;
  private readonly STORAGE_KEY_PRODUCTS = 'kc_master_products_cache_v3';

  readonly productsLoadedSignal = signal<number>(0);

  readonly ICONS: Record<string, string> = {
    sparklers: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 40 32 8"/><circle cx="32" cy="8" r="4" fill="currentColor" stroke="none"/><path d="M32 8 36 4M32 8 38 9M32 8 34 3" stroke-linecap="round"/></svg>`,
    'ground chakkars': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="30" r="7"/><path d="M24 30 8 18M24 30 40 18M24 30 6 30M24 30 42 30M24 30 12 40M24 30 36 40" stroke-linecap="round"/></svg>`,
    'flower pots': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 44 34 44 31 26 17 26Z"/><path d="M24 26 24 6M24 6 18 12M24 6 30 12M24 12 16 18M24 12 32 18" stroke-linecap="round"/></svg>`,
    'aerial shots': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="16" r="3" fill="currentColor" stroke="none"/><path d="M24 16 24 2M24 16 36 6M24 16 40 16M24 16 24 30M24 16 12 26M24 16 8 16M24 16 12 6" stroke-linecap="round"/><rect x="18" y="34" width="12" height="10" rx="1"/></svg>`,
    rockets: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M24 4C30 10 32 20 30 30l-12 0C16 20 18 10 24 4Z"/><path d="M18 30 12 40M30 30 36 40M20 30 20 40M28 30 28 40" stroke-linecap="round"/></svg>`,
    'kids novelty': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="24" r="16"/><path d="M24 15v18M15 24h18" stroke-linecap="round"/></svg>`,
    'sound crackers': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 20v8h6l10 8V12l-10 8Z"/><path d="M32 18a8 8 0 0 1 0 12M38 14a14 14 0 0 1 0 20" stroke-linecap="round"/></svg>`,
    'gift boxes': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="18" width="32" height="24" rx="1.5"/><path d="M8 26h32M24 18v24"/><path d="M24 18c-6 0-9-3-9-6a4 4 0 0 1 8-1c1-3 4-5 7-3s2 7-3 10Z"/></svg>`
  };

  private categoriesCache: Category[] = [];
  private rawCategoriesCache: Category[] = [];
  private masterProductsMap = new Map<string, Product>();

  constructor(private http: HttpClient) {
    this.loadProductsFromStorage();
    // Eagerly pre-load full catalogue into masterProductsMap on service creation
    this.fetchProducts().subscribe();
  }

  private filterActiveCategories(cats: Category[]): Category[] {
    const allProducts = Array.from(this.masterProductsMap.values());
    const updated = cats.map(c => {
      const cIdStr = c.id.toString();
      const cNameLower = c.name.trim().toLowerCase();
      const count = allProducts.length > 0
        ? allProducts.filter(p => 
            (p.categoryId && p.categoryId.toString() === cIdStr) || 
            (p.categoryName && p.categoryName.trim().toLowerCase() === cNameLower) ||
            (p.cat && p.cat.trim().toLowerCase() === cNameLower)
          ).length
        : c.count;
      return { ...c, count };
    });

    // If master products are loaded into memory, filter out 0-count categories EXCEPT "Gift Boxes"
    if (allProducts.length > 0) {
      return updated.filter(c => {
        const isGiftBoxCategory = c.name.toLowerCase().includes('gift');
        return c.count > 0 || isGiftBoxCategory;
      });
    }

    return updated;
  }

  private loadProductsFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.STORAGE_KEY_PRODUCTS);
        if (raw) {
          const parsed: Product[] = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach(p => this.masterProductsMap.set(p.code, p));
            this.productsLoadedSignal.update(n => n + 1);
          }
        }
      }
    } catch (err) {
      console.error('Error loading products cache from localStorage:', err);
    }
  }

  private saveProductsToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const products = Array.from(this.masterProductsMap.values());
        localStorage.setItem(this.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      }
    } catch (err) {
      console.error('Error saving products cache to localStorage:', err);
    }
  }

  fetchProducts(search?: string, categoryId?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoryId && categoryId > 0) params = params.set('categoryId', categoryId.toString());

    return this.http.get<ApiProduct[]>(this.apiUrl, { params }).pipe(
      map(apiProducts => {
        const mapped = apiProducts.map(p => this.mapApiToProduct(p));
        // If fetching full products list, clear stale cache map to purge any old codes (e.g. 101, 1001)
        if (!search && (!categoryId || categoryId === 0)) {
          this.masterProductsMap.clear();
        }
        mapped.forEach(p => this.masterProductsMap.set(p.code, p));
        this.saveProductsToStorage();
        if (this.rawCategoriesCache.length > 0) {
          this.categoriesCache = this.filterActiveCategories(this.rawCategoriesCache);
        }
        this.productsLoadedSignal.update(n => n + 1);
        return mapped;
      }),
      catchError(err => {
        console.error('Error fetching customer products from API:', err);
        const cached = Array.from(this.masterProductsMap.values());
        if (categoryId && categoryId > 0) {
          return of(cached.filter(p => p.categoryId === categoryId));
        }
        return of(cached);
      })
    );
  }

  fetchProductByCode(code: string): Observable<Product | undefined> {
    return this.http.get<ApiProduct>(`${this.apiUrl}/${code}`).pipe(
      map(p => {
        const mapped = this.mapApiToProduct(p);
        this.masterProductsMap.set(mapped.code, mapped);
        return mapped;
      }),
      catchError(() => {
        return of(this.masterProductsMap.get(code));
      })
    );
  }

  fetchCategories(): Observable<Category[]> {
    return this.http.get<any[]>(this.categoryApiUrl).pipe(
      map(cats => {
        const mapped: Category[] = cats.map(c => {
          const cId = (c.categoryId || c.id || '').toString();
          const cName = c.categoryName || c.name || '';
          return {
            id: cId,
            name: cName,
            count: 0,
            icon: cName.toLowerCase(),
            image: this.getCategoryDefaultImage(cName),
            desc: c.description || c.desc || `${cName} fireworks collection.`
          };
        });

        this.rawCategoriesCache = mapped;
        this.categoriesCache = this.filterActiveCategories(mapped);
        return this.categoriesCache;
      }),
      catchError(err => {
        console.error('Error fetching categories from API:', err);
        return of(this.categoriesCache);
      })
    );
  }

  // Synchronous getters for backward compatibility
  getProducts(): Product[] {
    return Array.from(this.masterProductsMap.values());
  }

  getCategories(): Category[] {
    return this.filterActiveCategories(this.rawCategoriesCache.length > 0 ? this.rawCategoriesCache : this.categoriesCache);
  }

  getProductByCode(code: string): Product | undefined {
    return this.masterProductsMap.get(code);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categoriesCache.find(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
  }

  private mapApiToProduct(p: ApiProduct): Product {
    const mrp = p.mrpPrice > 0 ? p.mrpPrice : (p.price > 0 ? p.price : p.discountPrice);
    const discPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
    const discPct = p.discountPercentage;
    const name = p.productName || (p as any).ProductName || '';
    const codeStr = (p.productCode || '').toString().trim();
    const nameLower = name.toLowerCase();

    let image = p.imageUrl && p.imageUrl.trim().length > 0 ? p.imageUrl.trim() : '/assets/images/sparklers.jpg';

    if (codeStr === '32' || nameLower.includes('free fire')) {
      image = '/assets/images/5g-free-fire-gun.jpg';
    } else if (codeStr === '33' || nameLower.includes('jackpot currency')) {
      image = '/assets/images/jackpot-currency.jpg';
    }

    return {
      productId: p.productId,
      code: p.productCode,
      name: name,
      cat: p.categoryName ? p.categoryName.toLowerCase().replace(/\s+/g, '') : 'sparklers',
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      price: discPrice,
      mrpPrice: mrp,
      discountPercentage: discPct,
      discountPrice: discPrice,
      totalQuantity: p.totalQuantity,
      unit: p.unit || '1 Box',
      badge: discPct > 0 ? `${discPct}% OFF` : (p.totalQuantity < 10 ? 'Low Stock' : null),
      image: image,
      desc: p.description || `Premium Sivakasi ${name}. Factory tested & safety checked.`,
      specs: {
        'Net weight': '400 g',
        'Burn type': 'Standard Sivakasi Spec',
        'Recommended use': 'Open outdoor space',
        'Stock Quantity': `${p.totalQuantity} Pcs Available`
      }
    };
  }

  private getCategoryDefaultImage(catName: string): string {
    const name = catName.toLowerCase();
    if (name.includes('sparkler')) return '/assets/images/kambi-sparklers.jpg';
    if (name.includes('chakkar')) return '/assets/images/ashoka-chakkar.jpg';
    if (name.includes('flower') || name.includes('pot') || name.includes('fountain')) return '/assets/images/golden-fountain.jpg';
    if (name.includes('aerial') || name.includes('shot')) return '/assets/images/thunder-king.jpg';
    if (name.includes('rocket')) return '/assets/images/sky-rocket.jpg';
    if (name.includes('novelty') || name.includes('kid')) return '/assets/images/kids-novelty.jpg';
    if (name.includes('sound') || name.includes('bomb') || name.includes('bijili')) return '/assets/images/bijili-deluxe.jpg';
    if (name.includes('gift') || name.includes('box')) return '/assets/images/family-giftbox.jpg';
    return '/assets/images/sparklers.jpg';
  }

  getCategoryIcon(catIdOrName: string): string {
    const key = (catIdOrName || '').toLowerCase();
    if (this.ICONS[key]) return this.ICONS[key];

    if (key.includes('sparkler')) return this.ICONS['sparklers'];
    if (key.includes('chakkar') || key.includes('spinner') || key.includes('wheel')) return this.ICONS['ground chakkars'];
    if (key.includes('flower') || key.includes('pot') || key.includes('fountain') || key.includes('kotti')) return this.ICONS['flower pots'];
    if (key.includes('aerial') || key.includes('ariel') || key.includes('shot') || key.includes('fancy') || key.includes('sky') || key.includes('rider') || key.includes('musical') || key.includes('function')) return this.ICONS['aerial shots'];
    if (key.includes('rocket') || key.includes('missile') || key.includes('lunik')) return this.ICONS['rockets'];
    if (key.includes('novelty') || key.includes('kid') || key.includes('toy') || key.includes('special')) return this.ICONS['kids novelty'];
    if (key.includes('sound') || key.includes('bomb') || key.includes('bijili') || key.includes('wala') || key.includes('cracker') || key.includes('vedi')) return this.ICONS['sound crackers'];
    if (key.includes('match') || key.includes('color') || key.includes('smoke')) return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 38l16-28"/><path d="M32 10c2-2 5-2 7 0s2 5 0 7"/><path d="M12 42l8-4"/></svg>`;
    if (key.includes('gift') || key.includes('box') || key.includes('pack')) return this.ICONS['gift boxes'];

    return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="24" r="16"/><path d="M24 14v20M14 24h20"/></svg>`;
  }

  formatPrice(price: number): string {
    return '₹' + (price || 0).toLocaleString('en-IN');
  }

  downloadPriceListPdfApi(categoryId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (categoryId && categoryId > 0) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get(`${environment.apiUrl}/products/price-list/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  triggerServerPdfDownload(categoryId?: number): void {
    this.downloadPriceListPdfApi(categoryId).subscribe({
      next: (blob: Blob) => {
        if (blob.size === 0) {
          alert('Failed to download PDF: Received empty file from server.');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Karthick_Crackers_Price_List_2026.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading server PDF:', err);
        alert('An error occurred while generating/downloading the PDF price list from the server. Please try again.');
      }
    });
  }

  exportPriceListCsv(products: Product[], categoryTitle?: string, categoryId?: number): void {
    this.generatePriceListPdf(products, categoryTitle, categoryId);
    this.triggerServerPdfDownload(categoryId);
  }

  generatePriceListPdf(products: Product[], categoryTitle?: string, categoryId?: number): void {
    if (!products || products.length === 0) return;

    // Group products by Category
    const categoryMap = new Map<string, Product[]>();
    products.forEach(p => {
      const catName = p.categoryName || (p.cat ? p.cat.toUpperCase() : 'GENERAL');
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, []);
      }
      categoryMap.get(catName)!.push(p);
    });

    const categoriesList = Array.from(categoryMap.entries());

    // Color palette for category headers
    const categoryColors = [
      '#8B0000', // Deep Red
      '#006400', // Dark Green
      '#1B4F72', // Dark Blue
      '#6C3483', // Purple
      '#7D6608', // Dark Gold
      '#78281F', // Rust Red
      '#117864', // Teal
      '#4A235A', // Indigo
      '#7E5109'  // Amber
    ];

    // Build Category Quick Summary Cards
    const summaryCardsHtml = categoriesList.map(([catName, prods], idx) => {
      const minPrice = Math.min(...prods.map(p => p.discountPrice || p.price));
      return `
        <div class="summary-card">
          <div class="sc-title">${catName}</div>
          <div class="sc-sub"><span>${prods.length} Items</span> <b>From ₹${minPrice.toFixed(0)}</b></div>
        </div>
      `;
    }).join('');

    let globalItemNum = 1;

    // Build Category Product Tables
    const categoryTablesHtml = categoriesList.map(([catName, prods], catIdx) => {
      const color = categoryColors[catIdx % categoryColors.length];
      const rowsHtml = prods.map((p) => {
        const mrpVal = (p.mrpPrice && p.mrpPrice > 0) ? p.mrpPrice : (p.price * 2.22);
        const offerVal = p.discountPrice || p.price;
        const itemIndex = globalItemNum++;

        return `
          <tr>
            <td class="col-num">${itemIndex}</td>
            <td class="col-desc">
              <div class="prod-name">${p.name}</div>
              <div class="prod-code">${p.code}</div>
            </td>
            <td class="col-unit">${p.unit || '1 Box'}</td>
            <td class="col-mrp">₹${mrpVal.toFixed(2)}</td>
            <td class="col-offer">₹${offerVal.toFixed(2)}</td>
            <td class="col-box"></td>
            <td class="col-box"></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="category-block">
          <div class="category-header" style="background-color: ${color};">
            <span>${catIdx + 1}. ${catName.toUpperCase()}</span>
            <span class="cat-badge">${prods.length} Products</span>
          </div>
          <table class="price-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="text-align: left;">PRODUCT DESCRIPTION</th>
                <th style="width: 140px; text-align: center;">PACKING / UNIT</th>
                <th style="width: 90px; text-align: right;">MRP (₹)</th>
                <th style="width: 100px; text-align: right;">OFFER (₹)</th>
                <th style="width: 60px; text-align: center;">QTY</th>
                <th style="width: 100px; text-align: right;">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    }).join('');

    const htmlContent = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, .pdf-wrap {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #1e272e;
      line-height: 1.4;
    }

    .pdf-wrap {
      width: 780px;
      margin: 0 auto;
      background: #ffffff;
      padding: 16px;
    }

    .pdf-section-block {
      background: #ffffff;
      margin-bottom: 16px;
    }

    /* HEADER BANNER */
    .header-banner {
      background: #090806;
      color: #ffffff;
      border-radius: 12px;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 2px solid #E5A93C;
    }

    .brand-title-box h1 {
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-title-box p {
      font-size: 11px;
      color: #E5A93C;
      letter-spacing: 2px;
      font-weight: 700;
      margin-top: 4px;
      text-transform: uppercase;
    }

    .address-box {
      text-align: right;
      font-size: 11.5px;
      color: #cbd5e0;
      line-height: 1.4;
    }

    .address-box strong {
      color: #F5C242;
      display: block;
      font-size: 12px;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    /* SUBHEADER */
    .subheader {
      text-align: center;
      padding: 10px 0;
    }
    .subheader p.eyebrow {
      font-size: 11.5px;
      font-weight: 800;
      color: #c53030;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .subheader h1 {
      font-size: 30px;
      font-weight: 900;
      color: #0b132b;
      margin-bottom: 6px;
    }
    .subheader p.subtext {
      font-size: 12px;
      color: #4a5568;
      max-width: 600px;
      margin: 0 auto;
    }

    /* OFFER STRIP */
    .offer-strip {
      background: #c53030;
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .offer-main { font-size: 18px; letter-spacing: 0.5px; font-weight: 900; }
    .offer-sub { font-size: 12px; opacity: 0.95; font-weight: 600; }

    /* STATS GRID */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat-box {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-val { font-size: 22px; font-weight: 900; color: #1a202c; }
    .stat-lbl { font-size: 10px; font-weight: 800; color: #718096; letter-spacing: 1px; margin-top: 2px; }

    /* QUICK SUMMARY */
    .summary-section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #2d3748;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .summary-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .sc-title { font-size: 11.5px; font-weight: 800; color: #1a202c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sc-sub { font-size: 10.5px; color: #718096; margin-top: 2px; display: flex; justify-content: space-between; }
    .sc-sub b { color: #e53e3e; }

    /* CATEGORY TABLES */
    .category-block {
      page-break-inside: avoid;
    }
    .category-header {
      padding: 10px 14px;
      color: #ffffff;
      font-weight: 800;
      font-size: 13.5px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      letter-spacing: 0.5px;
    }
    .cat-badge {
      background: rgba(255,255,255,0.25);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
    }

    .price-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border: 1px solid #cbd5e0;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      overflow: hidden;
      font-size: 12px;
    }
    .price-table th {
      background: #1a202c;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      border: 1px solid #2d3748;
    }
    .price-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #edf2f7;
      border-right: 1px solid #edf2f7;
      vertical-align: middle;
    }
    .price-table tr:nth-child(even) td {
      background: #f7fafc;
    }
    .col-num { text-align: center; color: #718096; font-weight: 700; width: 35px; }
    .col-desc { }
    .prod-name { font-weight: 700; color: #2d3748; font-size: 12.5px; }
    .prod-code { font-size: 10px; color: #a0aec0; font-family: monospace; }
    .col-unit { text-align: center; color: #4a5568; width: 130px; }
    .col-mrp { text-align: right; color: #718096; text-decoration: line-through; width: 85px; }
    .col-offer { text-align: right; color: #e53e3e; font-weight: 800; font-size: 12.5px; width: 95px; }
    .col-box { width: 55px; border: 1px dashed #cbd5e0 !important; background: #ffffff !important; }

    /* GIFT BANNER */
    .gift-banner {
      background: #d69e2e;
      color: #744210;
      font-weight: 900;
      font-size: 15px;
      text-align: center;
      padding: 14px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }

    /* NOTES & FOOTER */
    .notes-box {
      background: #fffaf0;
      border: 1px solid #feebc8;
      border-radius: 8px;
      padding: 16px;
    }
    .notes-box h4 { color: #9c4221; font-size: 13px; margin-bottom: 8px; font-weight: 800; }
    .notes-box ul { padding-left: 18px; font-size: 11.5px; color: #7b341e; line-height: 1.5; }

    .footer-bar {
      border-top: 2px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #718096;
    }
  </style>

  <div class="pdf-wrap" id="pdf-price-list-wrap">
    <!-- HEADER BANNER -->
    <div class="pdf-section-block header-banner">
      <div class="brand-title-box">
        <h1>Karthick Crackers</h1>
        <p>LIGHT UP THE CELEBRATION · WHOLESALE & RETAIL</p>
      </div>
      <div class="address-box">
        <strong>ADDRESS</strong>
        3/347/U, Inthira Group House,<br>
        Maraneri Village, Sivakasi - 626124
      </div>
    </div>

    <!-- SUBHEADER -->
    <div class="pdf-section-block subheader">
      <p class="eyebrow">DIRECT FROM SIVAKASI FACTORY OUTLET</p>
      <h1>Diwali 2026 Official Price List</h1>
      <p class="subtext">Buy original, high-quality Sivakasi crackers directly from our factory at lowest prices. Safe, fresh stock with mega discount for this Diwali celebration!</p>
    </div>

    <!-- OFFER STRIP -->
    <div class="pdf-section-block offer-strip">
      <span class="offer-main">Flat 55% OFF on All Crackers!</span>
      <span class="offer-sub">Special Festive Offer · Direct Sivakasi Factory Pricing</span>
    </div>

    <!-- STATS GRID -->
    <div class="pdf-section-block stats-grid">
      <div class="stat-box">
        <div class="stat-val">${products.length}</div>
        <div class="stat-lbl">TOTAL ITEMS</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Flat 55%</div>
        <div class="stat-lbl">MEGA DISCOUNT</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Diwali 2026</div>
        <div class="stat-lbl">SEASON OFFER</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Factory Price</div>
        <div class="stat-lbl">DIRECT SIVAKASI</div>
      </div>
    </div>

    <!-- QUICK SUMMARY CARDS -->
    <div class="pdf-section-block">
      <div class="summary-section-head">
        <span>PRODUCT CATEGORIES · QUICK SUMMARY</span>
        <span style="font-size: 11px; color: #718096;">Detailed price list below ↓</span>
      </div>
      <div class="summary-grid">
        ${summaryCardsHtml}
      </div>
    </div>

    <!-- DETAILED CATEGORY TABLES -->
    ${categoriesList.map(([catName, prods], catIdx) => {
      const color = categoryColors[catIdx % categoryColors.length];
      const rowsHtml = prods.map((p) => {
        const mrpVal = (p.mrpPrice && p.mrpPrice > 0) ? p.mrpPrice : (p.price * 2.22);
        const offerVal = p.discountPrice || p.price;
        const itemIndex = globalItemNum++;

        return `
          <tr>
            <td class="col-num">${itemIndex}</td>
            <td class="col-desc">
              <div class="prod-name">${p.name}</div>
              <div class="prod-code">${p.code}</div>
            </td>
            <td class="col-unit">${p.unit || '1 Box'}</td>
            <td class="col-mrp">₹${mrpVal.toFixed(2)}</td>
            <td class="col-offer">₹${offerVal.toFixed(2)}</td>
            <td class="col-box"></td>
            <td class="col-box"></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="pdf-section-block category-block">
          <div class="category-header" style="background-color: ${color};">
            <span>${catIdx + 1}. ${catName.toUpperCase()}</span>
            <span class="cat-badge">${prods.length} Products</span>
          </div>
          <table class="price-table">
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">#</th>
                <th style="text-align: left;">PRODUCT DESCRIPTION</th>
                <th style="width: 130px; text-align: center;">PACKING / UNIT</th>
                <th style="width: 85px; text-align: right;">MRP (₹)</th>
                <th style="width: 95px; text-align: right;">OFFER (₹)</th>
                <th style="width: 55px; text-align: center;">QTY</th>
                <th style="width: 85px; text-align: right;">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    }).join('')}

    <!-- GIFT BOX BANNER -->
    <div class="pdf-section-block gift-banner">
      🎁 All Kinds of Diwali Gift Boxes & Family Packs Available!
    </div>

    <!-- ORDER & SAFETY NOTES -->
    <div class="pdf-section-block notes-box">
      <h4>Order & Safety Notes</h4>
      <ul>
        <li>All prices listed are per box / piece as specified in the Variant column and are inclusive of applicable taxes.</li>
        <li>Prices and stock are subject to change without prior notice during peak festive demand — please confirm live pricing on our website.</li>
        <li>All products are manufactured in Sivakasi following strict quality and safety standards.</li>
        <li>Minors and children should use crackers only under adult supervision, in open outdoor spaces.</li>
        <li>Dispatch and transport details will be arranged and discussed directly with customers based on transport availability.</li>
      </ul>
    </div>

    <!-- FOOTER BAR -->
    <div class="pdf-section-block footer-bar">
      <span><strong>Karthick Crackers</strong> · Sivakasi, Tamil Nadu</span>
      <span>Official Price List 2026</span>
    </div>
  </div>
    `;

    const pdfFileName = categoryTitle
      ? `Karthick_Crackers_${categoryTitle.replace(/\s+/g, '_')}_Price_List_2026.pdf`
      : 'Karthick_Crackers_Price_List_2026.pdf';

    // Build Modal Dialog for Preview and Automatic Direct Download
    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'price-list-modal-wrapper';
    modalWrapper.style.position = 'fixed';
    modalWrapper.style.inset = '0';
    modalWrapper.style.background = 'rgba(11, 9, 7, 0.82)';
    modalWrapper.style.backdropFilter = 'blur(6px)';
    modalWrapper.style.zIndex = '1000000';
    modalWrapper.style.display = 'flex';
    modalWrapper.style.alignItems = 'center';
    modalWrapper.style.justifyContent = 'center';
    modalWrapper.style.padding = '20px';

    const modalCard = document.createElement('div');
    modalCard.style.width = '100%';
    modalCard.style.maxWidth = '840px';
    modalCard.style.maxHeight = '92vh';
    modalCard.style.background = '#ffffff';
    modalCard.style.borderRadius = '12px';
    modalCard.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
    modalCard.style.display = 'flex';
    modalCard.style.flexDirection = 'column';
    modalCard.style.overflow = 'hidden';

    // Toolbar Header
    const toolbar = document.createElement('div');
    toolbar.style.background = '#0B0907';
    toolbar.style.color = '#FFFFFF';
    toolbar.style.padding = '14px 24px';
    toolbar.style.display = 'flex';
    toolbar.style.alignItems = 'center';
    toolbar.style.justifyContent = 'space-between';
    toolbar.style.borderBottom = '2px solid #F5C242';

    toolbar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">🎆</span>
        <b style="font-size: 15px; color: #F5C242; font-family: sans-serif;">Karthick Crackers Price List 2026 (55% OFF)</b>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="download-pdf-now-btn" style="background: linear-gradient(135deg, #FFB800, #D48800); color: #000; font-weight: 800; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 12.5px; font-family: sans-serif; display: flex; align-items: center; gap: 6px;">
          📥 Save PDF File
        </button>
        <button id="close-modal-btn" style="background: rgba(255,255,255,0.15); color: #FFF; border: 1px solid rgba(255,255,255,0.3); padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 12.5px; font-family: sans-serif;">
          ✕ Close
        </button>
      </div>
    `;

    // Modal Scrollable Content
    const modalBody = document.createElement('div');
    modalBody.style.flex = '1';
    modalBody.style.overflowY = 'auto';
    modalBody.style.padding = '16px';
    modalBody.style.background = '#F8FAFC';
    modalBody.innerHTML = htmlContent;

    modalCard.appendChild(toolbar);
    modalCard.appendChild(modalBody);
    modalWrapper.appendChild(modalCard);
    document.body.appendChild(modalWrapper);

    const closeModal = () => {
      if (document.body.contains(modalWrapper)) {
        document.body.removeChild(modalWrapper);
      }
    };

    const downloadPdfFile = () => {
      window.print();
    };

    // Attach event listeners
    const downloadBtn = toolbar.querySelector('#download-pdf-now-btn');
    const closeBtn = toolbar.querySelector('#close-modal-btn');

    if (downloadBtn) downloadBtn.addEventListener('click', downloadPdfFile);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }
}
