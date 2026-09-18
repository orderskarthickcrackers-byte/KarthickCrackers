import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  productId: number;
  productCode: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  description?: string;
  price: number;
  mrpPrice: number;
  discountPercentage: number;
  discountPrice: number;
  totalQuantity: number;
  unit?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
}

export interface CreateProductRequest {
  productCode: string;
  productName: string;
  categoryId: number;
  description?: string;
  mrpPrice: number;
  discountPercentage: number;
  unit?: string;
  totalQuantity: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
}

export interface UpdateProductRequest {
  productCode: string;
  productName: string;
  categoryId: number;
  description?: string;
  mrpPrice: number;
  discountPercentage: number;
  unit?: string;
  totalQuantity: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export interface ProductImportRowError {
  rowNumber: number;
  productCode: string;
  productName: string;
  reason: string;
}

export interface ProductImportResult {
  totalRecords: number;
  successfullyImported: number;
  failedCount: number;
  failedRecords: ProductImportRowError[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private apiUrl = `${environment.apiUrl}/admin/products`;
  private categoryUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getProducts(search?: string, categoryId?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (categoryId && categoryId > 0) params = params.set('categoryId', categoryId.toString());
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(dto: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, dto);
  }

  updateProduct(id: number, dto: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, dto);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl);
  }

  importProducts(file: File): Observable<ProductImportResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ProductImportResult>(`${this.apiUrl}/import`, formData);
  }
}
