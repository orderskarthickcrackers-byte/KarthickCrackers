import { Injectable, signal, computed } from '@angular/core';
import { CartItem, OrderDetails } from '../models/product.model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly MIN_ORDER_AMOUNT = 2500;
  private readonly STORAGE_KEY_CART = 'kc_cart_items_v1';
  private readonly STORAGE_KEY_LAST_ORDER = 'kc_last_order_v1';

  // Initial cart state
  private cartItemsSignal = signal<CartItem[]>([]);

  // Toast notification signal
  toastMessage = signal<string>('');
  toastVisible = signal<boolean>(false);
  private toastTimeout: any;

  // Last completed order signal
  lastOrder = signal<OrderDetails | null>(null);

  constructor(private productService: ProductService) {
    this.loadCartFromStorage();
    this.loadLastOrderFromStorage();
  }

  private loadCartFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.STORAGE_KEY_CART);
        if (raw) {
          const parsed: CartItem[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.cartItemsSignal.set(parsed);
          }
        }
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
    }
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY_CART, JSON.stringify(items));
      }
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }

  private loadLastOrderFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(this.STORAGE_KEY_LAST_ORDER) || localStorage.getItem(this.STORAGE_KEY_LAST_ORDER);
        if (raw) {
          const parsed: OrderDetails = JSON.parse(raw);
          if (parsed && parsed.orderId) {
            this.lastOrder.set(parsed);
          }
        }
      }
    } catch (err) {
      console.error('Error loading last order from storage:', err);
    }
  }

  private saveLastOrderToStorage(order: OrderDetails | null): void {
    try {
      if (typeof window !== 'undefined') {
        if (order) {
          const json = JSON.stringify(order);
          sessionStorage.setItem(this.STORAGE_KEY_LAST_ORDER, json);
          localStorage.setItem(this.STORAGE_KEY_LAST_ORDER, json);
        } else {
          sessionStorage.removeItem(this.STORAGE_KEY_LAST_ORDER);
          localStorage.removeItem(this.STORAGE_KEY_LAST_ORDER);
        }
      }
    } catch (err) {
      console.error('Error saving last order to storage:', err);
    }
  }

  get cartItems() {
    return this.cartItemsSignal.asReadonly();
  }

  readonly cartCount = computed(() => {
    return this.cartItemsSignal().reduce((sum, item) => sum + item.qty, 0);
  });

  readonly cartSubtotal = computed(() => {
    // Touch productsLoadedSignal so computed re-evaluates whenever product catalog hydrates or updates
    this.productService.productsLoadedSignal();
    return this.cartItemsSignal().reduce((sum, item) => {
      const p = this.productService.getProductByCode(item.code);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  });

  readonly cartDiscount = computed(() => 0);

  readonly cartTotal = computed(() => {
    return this.cartSubtotal();
  });

  readonly isMinimumOrderMet = computed(() => {
    return this.cartTotal() >= this.MIN_ORDER_AMOUNT;
  });

  readonly minOrderShortfall = computed(() => {
    return Math.max(0, this.MIN_ORDER_AMOUNT - this.cartTotal());
  });

  getItemQty(code: string): number {
    const item = this.cartItemsSignal().find(i => i.code === code);
    return item ? item.qty : 0;
  }

  addToCart(code: string, qty: number = 1): void {
    const current = [...this.cartItemsSignal()];
    const index = current.findIndex(i => i.code === code);
    if (index > -1) {
      current[index] = { ...current[index], qty: current[index].qty + qty };
    } else {
      current.push({ code, qty });
    }
    this.cartItemsSignal.set(current);
    this.saveCartToStorage(current);
    this.showToast('Added to cart');
  }

  decrementQty(code: string): void {
    const current = [...this.cartItemsSignal()];
    const index = current.findIndex(i => i.code === code);
    if (index > -1) {
      if (current[index].qty > 1) {
        current[index] = { ...current[index], qty: current[index].qty - 1 };
        this.cartItemsSignal.set(current);
        this.saveCartToStorage(current);
      } else {
        this.removeFromCart(code);
      }
    }
  }

  removeFromCart(code: string): void {
    const updated = this.cartItemsSignal().filter(i => i.code !== code);
    this.cartItemsSignal.set(updated);
    this.saveCartToStorage(updated);
  }

  setQty(code: string, qty: number): void {
    if (qty < 1) {
      this.removeFromCart(code);
      return;
    }
    const current = [...this.cartItemsSignal()];
    const index = current.findIndex(i => i.code === code);
    if (index > -1) {
      current[index] = { ...current[index], qty };
      this.cartItemsSignal.set(current);
      this.saveCartToStorage(current);
    } else {
      current.push({ code, qty });
      this.cartItemsSignal.set(current);
      this.saveCartToStorage(current);
    }
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveCartToStorage([]);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastVisible.set(false);
    }, 1800);
  }

  setLastOrder(order: OrderDetails): void {
    this.lastOrder.set(order);
    this.saveLastOrderToStorage(order);
  }
}
