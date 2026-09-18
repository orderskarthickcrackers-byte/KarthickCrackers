import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { PaymentSettingsService } from '../../services/payment-settings.service';
import { Product, OrderDetails } from '../../models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  name: string = '';
  mobile: string = '';
  email: string = '';
  address: string = '';
  city: string = '';
  pincode: string = '';
  remarks: string = '';

  isSubmitting = false;
  submitError = '';

  errors = {
    name: false,
    mobile: false,
    address: false,
    city: false,
    pincode: false
  };

  constructor(
    public cartService: CartService,
    private productService: ProductService,
    public paymentSettingsService: PaymentSettingsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.fetchProducts().subscribe();

    if (!this.cartService.isMinimumOrderMet() && this.cartService.cartItems().length > 0) {
      this.cartService.showToast('Minimum order amount is ₹2,500');
      this.router.navigate(['/cart']);
    }
  }

  getProduct(code: string): Product | undefined {
    return this.productService.getProductByCode(code);
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  validate(): boolean {
    this.errors.name = this.name.trim().length <= 1;
    this.errors.mobile = !/^\d{10}$/.test(this.mobile.trim());
    this.errors.address = this.address.trim().length <= 4;
    this.errors.city = this.city.trim().length <= 1;
    this.errors.pincode = !/^\d{6}$/.test(this.pincode.trim());

    if (this.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.submitError = 'Please enter a valid email address or leave it blank.';
      return false;
    }

    return !(this.errors.name || this.errors.mobile || this.errors.address || this.errors.city || this.errors.pincode);
  }

  onPlaceOrder(): void {
    this.submitError = '';
    if (!this.validate()) return;

    if (this.cartService.cartItems().length === 0) {
      this.cartService.showToast('Your cart is empty');
      this.router.navigate(['/cart']);
      return;
    }

    if (!this.cartService.isMinimumOrderMet()) {
      this.submitError = `Minimum order amount is ₹2,500. Please add ${this.formatPrice(this.cartService.minOrderShortfall())} more to proceed.`;
      return;
    }

    this.isSubmitting = true;

    // Prepare API items payload
    const itemsPayload = this.cartService.cartItems().map(item => {
      const p = this.getProduct(item.code);
      return {
        productId: p ? p.productId || 1 : 1,
        quantity: item.qty
      };
    });

    const payload = {
      customerName: this.name.trim(),
      mobileNumber: this.mobile.trim(),
      email: this.email.trim() || null,
      address: this.address.trim(),
      city: this.city.trim(),
      pincode: this.pincode.trim(),
      remarks: this.remarks.trim() || null,
      items: itemsPayload
    };

    this.http.post<any>(`${environment.apiUrl}/orders`, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        const items = this.cartService.cartItems().map(item => {
          const p = this.getProduct(item.code)!;
          return {
            product: p,
            qty: item.qty,
            lineTotal: p ? p.price * item.qty : 0
          };
        });

        const lastOrder: OrderDetails = {
          orderId: res.orderNumber || `KC-${Math.floor(10000 + Math.random() * 90000)}`,
          customerName: res.customerName || this.name.trim(),
          mobile: res.mobileNumber || this.mobile.trim(),
          address: res.address || this.address.trim(),
          city: res.city || this.city.trim(),
          pincode: res.pincode || this.pincode.trim(),
          remarks: this.remarks.trim(),
          totalAmount: res.totalAmount || this.cartService.cartTotal(),
          items
        };

        this.cartService.setLastOrder(lastOrder);
        this.cartService.clearCart();
        this.router.navigate(['/confirmation']);
      },
      error: (err) => {
        console.error('Order API error:', err);
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to place order. Please try again or contact support.';
      }
    });
  }
}
