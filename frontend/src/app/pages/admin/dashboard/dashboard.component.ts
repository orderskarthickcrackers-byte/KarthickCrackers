import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { DashboardService, DashboardStats, RecentOrder } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;
  errorMessage = '';

  // Filter & Pagination state for Orders list
  searchQuery = '';
  statusFilter = 'All';
  page = 1;
  pageSize = 10;

  // Edit Status Modal state
  selectedOrder: RecentOrder | null = null;
  isEditModalOpen = false;
  newStatus = 'Dispatched';
  statusRemarks = '';
  isUpdatingStatus = false;
  updateSuccessMessage = '';

  // View Order Products Modal state
  selectedViewOrder: RecentOrder | null = null;
  isViewModalOpen = false;

  readonly availableStatuses = [
    'Order Placed',
    'Confirmed',
    'Processing',
    'Dispatched',
    'Delivered',
    'Cancelled'
  ];

  constructor(
    private dashboardService: DashboardService,
    private http: HttpClient,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard stats load error:', err);
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to backend server at http://localhost:5083. Please ensure the API server is running.';
        } else {
          this.errorMessage = err.error?.message || `Failed to load dashboard stats (Status: ${err.status}).`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  get filteredOrders(): RecentOrder[] {
    if (!this.stats || !this.stats.recentOrders) return [];
    let list = [...this.stats.recentOrders];

    if (this.statusFilter && this.statusFilter !== 'All') {
      list = list.filter(o => o.status?.toLowerCase() === this.statusFilter.toLowerCase());
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(o => 
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.city?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  get pagedOrders(): RecentOrder[] {
    const list = this.filteredOrders;
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const count = this.filteredOrders.length;
    return Math.max(1, Math.ceil(count / this.pageSize));
  }

  onFilterChange(): void {
    this.page = 1;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
    }
  }

  openEditStatusModal(order: RecentOrder): void {
    this.selectedOrder = order;
    this.newStatus = order.status || 'Dispatched';
    this.statusRemarks = '';
    this.updateSuccessMessage = '';
    this.isEditModalOpen = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedOrder = null;
    this.updateSuccessMessage = '';
    this.cdr.detectChanges();
  }

  openViewOrderModal(order: RecentOrder): void {
    this.selectedViewOrder = order;
    this.isViewModalOpen = true;
    this.cdr.detectChanges();
  }

  closeViewOrderModal(): void {
    this.isViewModalOpen = false;
    this.selectedViewOrder = null;
    this.cdr.detectChanges();
  }

  submitStatusUpdate(): void {
    if (!this.selectedOrder) return;

    this.isUpdatingStatus = true;
    this.updateSuccessMessage = '';

    const payload = {
      status: this.newStatus,
      remarks: this.statusRemarks || `Status updated to ${this.newStatus}`
    };

    this.http.put<any>(`${environment.apiUrl}/orders/admin/${this.selectedOrder.orderId}/status`, payload).subscribe({
      next: (res) => {
        this.isUpdatingStatus = false;
        if (this.selectedOrder) {
          this.selectedOrder.status = this.newStatus;
        }
        this.updateSuccessMessage = `Order status successfully updated to '${this.newStatus}'!`;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.closeEditModal();
          this.loadDashboardData();
        }, 1200);
      },
      error: (err) => {
        console.error('Status update failed:', err);
        this.isUpdatingStatus = false;
        this.errorMessage = err.error?.message || 'Failed to update order status.';
        this.cdr.detectChanges();
      }
    });
  }

  getWhatsAppLink(order: RecentOrder): string {
    let msg = `Hi ${order.customerName},\nYour Karthick Crackers Order #${order.orderNumber} status has been updated to *${order.status}*.\nTotal Amount: ₹${order.totalAmount}\nThank you for choosing Karthick Crackers!`;
    const phone = order.customerPhone?.replace(/\D/g, '') || '6380891094';
    return `https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(msg)}`;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'order placed':
      case 'confirmed':
      case 'processing':
        return 'badge-pending';
      case 'dispatched':
        return 'badge-dispatched';
      case 'delivered':
        return 'badge-delivered';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  }
}
