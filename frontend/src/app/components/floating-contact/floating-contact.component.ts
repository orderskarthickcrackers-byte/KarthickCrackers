import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSettingsService } from '../../services/payment-settings.service';

@Component({
  selector: 'app-floating-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-contact.component.html',
  styleUrls: ['./floating-contact.component.scss']
})
export class FloatingContactComponent {
  constructor(public paymentSettingsService: PaymentSettingsService) {}
}
