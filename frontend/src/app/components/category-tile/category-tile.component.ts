import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-category-tile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-tile.component.html'
})
export class CategoryTileComponent {
  @Input({ required: true }) category!: Category;

  constructor(
    private productService: ProductService,
    private sanitizer: DomSanitizer
  ) {}

  get categoryIconSvg(): SafeHtml {
    const rawSvg = this.productService.getCategoryIcon(this.category.name || this.category.icon || this.category.id);
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }
}
