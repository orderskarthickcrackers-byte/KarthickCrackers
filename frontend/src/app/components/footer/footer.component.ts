import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { PaymentSettingsService } from '../../services/payment-settings.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private productService: ProductService,
    public paymentSettingsService: PaymentSettingsService
  ) {}

  ngOnInit(): void {
    this.productService.fetchCategories().subscribe(cats => {
      this.categories = cats.slice(0, 6);
    });
  }
}
