import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { PaymentSettingsService, PaymentSetting } from '../../services/payment-settings.service';
import { OrderDetails } from '../../models/product.model';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmation.component.html'
})
export class ConfirmationComponent implements OnInit {
  order: OrderDetails | null = null;
  isPlayingAnimation = false;
  upiId = '9952378965@upi';
  upiQrCodeUrl = 'assets/images/upi-qr.png';
  callNumber = '+91 6380891094';
  copiedUpi = false;

  public cartService = inject(CartService);
  private productService = inject(ProductService);
  public paymentSettingsService = inject(PaymentSettingsService);

  ngOnInit(): void {
    this.order = this.cartService.lastOrder() || {
      orderId: 'KC10001',
      customerName: 'Karthick Raja',
      mobile: '6380891094',
      address: '3/347/U, Inthira Group House, Maraneri Village',
      city: 'Sivakasi',
      pincode: '626124',
      totalAmount: 2500,
      items: []
    };

    setTimeout(() => {
      this.isPlayingAnimation = true;
    }, 100);

    // Fetch dynamic payment settings
    this.paymentSettingsService.getPublicPaymentSettings().subscribe({
      next: (setting: PaymentSetting) => {
        if (setting) {
          if (setting.upiId) this.upiId = setting.upiId;
          if (setting.upiQrCodeUrl) this.upiQrCodeUrl = setting.upiQrCodeUrl;
          if (setting.callNumber) this.callNumber = setting.callNumber;
        }
      },
      error: (err) => {
        console.warn('Using default payment settings:', err);
      }
    });
  }

  copyUpiId(): void {
    navigator.clipboard.writeText(this.upiId).then(() => {
      this.copiedUpi = true;
      setTimeout(() => {
        this.copiedUpi = false;
      }, 2500);
    });
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  getFormattedMessage(): string {
    if (!this.order) return '';

    let text = `🎆 *KARTHICK CRACKERS - OFFICIAL ORDER BILL* 🎆\n`;
    text += `----------------------------------------\n`;
    text += `*Order Number:* ${this.order.orderId}\n`;
    text += `*Customer Name:* ${this.order.customerName}\n`;
    text += `*Mobile Number:* ${this.order.mobile}\n`;
    text += `*Delivery Address:* ${this.order.address}, ${this.order.city} - ${this.order.pincode}\n`;
    text += `----------------------------------------\n`;
    text += `*ITEMIZED RAW BILL & PRODUCT LIST:*\n`;

    if (this.order.items && this.order.items.length > 0) {
      this.order.items.forEach((item, idx) => {
        const code = item.product?.code || 'ITEM';
        const name = item.product?.name || 'Firework Product';
        text += `${idx + 1}. [${code}] ${name} (x${item.qty}) - ${this.formatPrice(item.lineTotal)}\n`;
      });
    } else {
      text += `Itemized breakdown included in PDF document.\n`;
    }

    text += `----------------------------------------\n`;
    text += `*NET TOTAL AMOUNT:* ${this.formatPrice(this.order.totalAmount)}\n`;
    text += `----------------------------------------\n`;
    text += `💳 *PAYMENT POLICY: STRICTLY UPI PAYMENTS ONLY*\n`;
    text += `UPI ID: *${this.upiId}*\n`;
    text += `(Strictly NO Cash On Delivery / COD)\n`;
    text += `----------------------------------------\n`;
    text += `📄 *Download Official PDF Order Bill Document:*\n`;
    text += `http://localhost:5083/api/orders/number/${this.order.orderId}/pdf`;

    return text;
  }

  getOwnerWhatsAppUrl(): string {
    return `https://wa.me/${this.paymentSettingsService.cleanPhoneSignal()}?text=${encodeURIComponent(this.getFormattedMessage())}`;
  }

  getCustomerWhatsAppUrl(): string {
    if (!this.order || !this.order.mobile) return '#';
    const cleanMobile = this.order.mobile.replace(/[^0-9]/g, '');
    const phone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    return `https://wa.me/${phone}?text=${encodeURIComponent(this.getFormattedMessage())}`;
  }

  getPdfInvoiceUrl(): string {
    if (!this.order) return '#';
    return `http://localhost:5083/api/orders/number/${this.order.orderId}/pdf`;
  }
}
