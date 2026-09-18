import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItemDto {
  orderItemId: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface RecentOrder {
  orderId: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  city?: string;
  address?: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  itemsCount?: number;
  items?: OrderItemDto[];
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: RecentOrder[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }
}
