import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';

export interface CustomerItem {
  customerId: number;
  fullName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  remarks?: string;
  totalOrders: number;
  totalSpent: number;
  createdDate: string;
}

export interface CustomerDetail extends CustomerItem {
  orderHistory: any[];
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
  customers: CustomerItem[] = [];
  isLoading = true;
  errorMessage = '';

  searchQuery = '';
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  selectedCustomer: CustomerDetail | null = null;
  isViewModalOpen = false;

  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isSaving = false;
  isDeleting = false;
  actionSuccessMessage = '';
  actionErrorMessage = '';

  editCustomerData = {
    customerId: 0,
    fullName: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    remarks: ''
  };

  customerToDelete: CustomerItem | null = null;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    let url = `http://localhost:5083/api/admin/customers?page=${this.page}&pageSize=${this.pageSize}`;
    if (this.searchQuery.trim()) {
      url += `&search=${encodeURIComponent(this.searchQuery.trim())}`;
    }

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.customers = res.data || [];
        this.totalCount = res.totalCount || 0;
        this.totalPages = res.totalPages || 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load customers list.';
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadCustomers();
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.loadCustomers();
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      this.loadCustomers();
    }
  }

  openViewModal(cust: CustomerItem): void {
    this.http.get<CustomerDetail>(`http://localhost:5083/api/admin/customers/${cust.customerId}`).subscribe({
      next: (detail) => {
        this.selectedCustomer = detail;
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load customer details:', err);
        this.selectedCustomer = { ...cust, orderHistory: [] };
        this.isViewModalOpen = true;
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal(cust: CustomerItem): void {
    this.actionErrorMessage = '';
    this.actionSuccessMessage = '';
    this.editCustomerData = {
      customerId: cust.customerId,
      fullName: cust.fullName || '',
      mobileNumber: cust.mobileNumber || '',
      email: cust.email || '',
      address: cust.address || '',
      city: cust.city || '',
      pincode: cust.pincode || '',
      remarks: cust.remarks || ''
    };
    this.isEditModalOpen = true;
    this.cdr.detectChanges();
  }

  saveCustomer(): void {
    if (!this.editCustomerData.fullName.trim() || !this.editCustomerData.mobileNumber.trim()) {
      this.actionErrorMessage = 'Full Name and Mobile Number are required.';
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.actionErrorMessage = '';
    this.actionSuccessMessage = '';

    const url = `http://localhost:5083/api/admin/customers/${this.editCustomerData.customerId}`;
    this.http.put<CustomerItem>(url, this.editCustomerData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.isEditModalOpen = false;
        this.loadCustomers();
      },
      error: (err) => {
        console.error('Failed to update customer:', err);
        this.isSaving = false;
        this.actionErrorMessage = err.error?.message || 'Failed to update customer details.';
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(cust: CustomerItem): void {
    this.customerToDelete = cust;
    this.actionErrorMessage = '';
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  confirmDeleteCustomer(): void {
    if (!this.customerToDelete) return;

    this.isDeleting = true;
    this.actionErrorMessage = '';

    const url = `http://localhost:5083/api/admin/customers/${this.customerToDelete.customerId}`;
    this.http.delete<any>(url).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.customerToDelete = null;
        this.loadCustomers();
      },
      error: (err) => {
        console.error('Failed to delete customer:', err);
        this.isDeleting = false;
        this.actionErrorMessage = err.error?.message || 'Failed to delete customer.';
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    this.isViewModalOpen = false;
    this.isEditModalOpen = false;
    this.isDeleteModalOpen = false;
    this.selectedCustomer = null;
    this.customerToDelete = null;
    this.cdr.detectChanges();
  }

  formatPrice(val: number): string {
    return this.productService.formatPrice(val);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'order placed':
      case 'confirmed':
      case 'processing':
        return 'status-active';
      case 'dispatched':
        return 'category-pill';
      case 'delivered':
        return 'status-active';
      case 'cancelled':
        return 'status-inactive';
      default:
        return 'category-pill';
    }
  }
}
