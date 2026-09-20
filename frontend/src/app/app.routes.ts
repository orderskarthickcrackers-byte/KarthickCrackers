import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'products', loadComponent: () => import('./pages/listing/listing.component').then(m => m.ListingComponent) },
  { path: 'listing', redirectTo: 'products', pathMatch: 'full' },
  { path: 'quick-order', loadComponent: () => import('./pages/quick-order/quick-order.component').then(m => m.QuickOrderComponent) },
  { path: 'categories', redirectTo: 'categories/all', pathMatch: 'full' },
  { path: 'category', redirectTo: 'categories/all', pathMatch: 'full' },
  { path: 'categories/:slug', loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent) },
  { path: 'category/:id', redirectTo: 'categories/:id', pathMatch: 'full' },
  { path: 'products/:slug', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent) },
  { path: 'detail/:code', redirectTo: 'products/:code', pathMatch: 'full' },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'confirmation', loadComponent: () => import('./pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
  { path: 'faq', loadComponent: () => import('./pages/faq/faq').then(m => m.Faq) },
  { path: 'crackers-price-list', loadComponent: () => import('./pages/price-list/price-list').then(m => m.PriceList) },
  { path: 'admin/login', loadComponent: () => import('./pages/admin/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'admin/dashboard', 
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin/products/products.component').then(m => m.AdminProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/customers',
    loadComponent: () => import('./pages/admin/customers/customers.component').then(m => m.CustomersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.AdminSettingsComponent),
    canActivate: [authGuard]
  },
  { path: '404', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
  { path: '**', redirectTo: '404' }
];

