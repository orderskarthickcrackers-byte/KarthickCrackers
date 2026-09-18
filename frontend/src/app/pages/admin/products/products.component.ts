import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { AdminProductService, Product, Category, CreateProductRequest, UpdateProductRequest, ProductImportResult } from '../../../services/admin-product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './products.component.html'
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Filter state
  searchTerm = '';
  selectedCategoryId: number = 0;

  // Pagination state
  page = 1;
  pageSize = 10;

  // Modal states
  isAddEditModalOpen = false;
  isEditMode = false;
  editingProductId: number | null = null;

  isViewModalOpen = false;
  viewingProduct: Product | null = null;

  isImportModalOpen = false;
  selectedFile: File | null = null;
  isUploading = false;
  importResult: ProductImportResult | null = null;

  // Add/Edit Form model
  formData: CreateProductRequest = {
    productCode: '',
    productName: '',
    categoryId: 1,
    description: '',
    mrpPrice: 0,
    discountPercentage: 0,
    unit: '1 Box',
    totalQuantity: 50,
    imageUrl: '/assets/images/sparklers.jpg',
    isAvailable: true,
    isActive: true
  };

  calculatedDiscountPrice: number = 0;

  constructor(
    private productService: AdminProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        if (cats.length > 0 && this.formData.categoryId === 0) {
          this.formData.categoryId = cats[0].categoryId;
        }
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.productService.getProducts(this.searchTerm, this.selectedCategoryId).subscribe({
      next: (data) => {
        this.products = data;
        this.page = 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load products.';
        this.cdr.detectChanges();
      }
    });
  }

  get pagedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.products.length / this.pageSize));
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
    }
  }

  onSearchOrFilterChange(): void {
    this.page = 1;
    this.loadProducts();
  }

  onPageSizeChange(): void {
    this.page = 1;
  }

  // Realtime Discount Price Calculation
  onPriceOrDiscountChange(): void {
    const mrp = Number(this.formData.mrpPrice) || 0;
    const disc = Number(this.formData.discountPercentage) || 0;

    if (disc < 0) this.formData.discountPercentage = 0;
    if (disc > 100) this.formData.discountPercentage = 100;

    const safeDisc = Math.min(100, Math.max(0, disc));
    if (mrp <= 0) {
      this.calculatedDiscountPrice = 0;
    } else {
      const calc = mrp - (mrp * safeDisc / 100);
      this.calculatedDiscountPrice = Math.round(calc * 100) / 100;
    }
  }

  // Open Add Product Modal
  openAddModal(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.formData = {
      productCode: `${Math.floor(100 + Math.random() * 900)}`,
      productName: '',
      categoryId: this.categories.length > 0 ? this.categories[0].categoryId : 1,
      description: '',
      mrpPrice: 0,
      discountPercentage: 20,
      unit: '1 Box',
      totalQuantity: 50,
      imageUrl: '/assets/images/sparklers.jpg',
      isAvailable: true,
      isActive: true
    };
    this.onPriceOrDiscountChange();
    this.isAddEditModalOpen = true;
  }

  // Open Edit Product Modal
  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product.productId;
    this.formData = {
      productCode: product.productCode,
      productName: product.productName,
      categoryId: product.categoryId,
      description: product.description || '',
      mrpPrice: product.mrpPrice,
      discountPercentage: product.discountPercentage,
      unit: product.unit || '1 Box',
      totalQuantity: product.totalQuantity,
      imageUrl: product.imageUrl || '/assets/images/sparklers.jpg',
      isAvailable: product.isAvailable,
      isActive: product.isActive
    };
    this.onPriceOrDiscountChange();
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal(): void {
    this.isAddEditModalOpen = false;
  }

  // Save Product (Add or Edit)
  saveProduct(): void {
    if (!this.formData.productCode || !this.formData.productName) {
      alert('Please fill out all required fields: Product Code and Product Name.');
      return;
    }

    if (this.formData.mrpPrice < 0) {
      alert('MRP Price cannot be negative.');
      return;
    }

    if (this.formData.discountPercentage < 0 || this.formData.discountPercentage > 100) {
      alert('Discount Percentage must be between 0% and 100%.');
      return;
    }

    if (this.isEditMode && this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, this.formData).subscribe({
        next: () => {
          this.showSuccess('Product updated successfully.');
          this.closeAddEditModal();
          this.loadProducts();
        },
        error: (err) => alert(err.error?.message || 'Failed to update product.')
      });
    } else {
      this.productService.createProduct(this.formData).subscribe({
        next: () => {
          this.showSuccess('Product created successfully.');
          this.closeAddEditModal();
          this.loadProducts();
        },
        error: (err) => alert(err.error?.message || 'Failed to create product.')
      });
    }
  }

  // Open View Modal
  openViewModal(product: Product): void {
    this.viewingProduct = product;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingProduct = null;
  }

  // Delete / Deactivate Product
  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to deactivate product '${product.productName}' (${product.productCode})?`)) {
      this.productService.deleteProduct(product.productId).subscribe({
        next: () => {
          this.showSuccess(`Product '${product.productName}' deactivated.`);
          this.loadProducts();
        },
        error: (err) => alert(err.error?.message || 'Failed to deactivate product.')
      });
    }
  }

  // Excel Upload Modal logic
  openImportModal(): void {
    this.selectedFile = null;
    this.importResult = null;
    this.isImportModalOpen = true;
  }

  closeImportModal(): void {
    this.isImportModalOpen = false;
    this.selectedFile = null;
    this.importResult = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a CSV or Excel file to upload.');
      return;
    }

    this.isUploading = true;
    this.importResult = null;

    this.productService.importProducts(this.selectedFile).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.importResult = res;
        if (res.successfullyImported > 0) {
          this.showSuccess(`Bulk Import completed! ${res.successfullyImported} products imported.`);
          this.loadProducts();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUploading = false;
        alert(err.error?.message || 'Failed to process file import.');
        this.cdr.detectChanges();
      }
    });
  }

  downloadSampleCsv(): void {
    const csvContent = `ProductCode,ProductName,Category,Description,MRPPrice,DiscountPercentage,Unit,TotalQuantity,ImageUrl,IsAvailable,IsActive\n"1","Sample Sparklers Deluxe","Sparklers","High quality electric sparklers",150.00,20,"1 Box",50,"/assets/images/sparklers.jpg",true,true\n"2","Sample Multi Shot Aerial","Aerial Shots","30-shot fancy sky aerial",2500.00,25,"1 Piece",30,"/assets/images/thunder-king.jpg",true,true`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Sample_Products_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }
}
