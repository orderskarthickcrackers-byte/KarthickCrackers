export interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  image: string;
  desc: string;
}

export interface ProductSpecs {
  [key: string]: string;
}

export interface Product {
  productId?: number;
  code: string;
  name: string;
  cat: string;
  categoryId?: number;
  categoryName?: string;
  price: number;
  mrpPrice?: number;
  discountPercentage?: number;
  discountPrice?: number;
  totalQuantity?: number;
  unit: string;
  badge: string | null;
  image: string;
  desc: string;
  specs?: ProductSpecs;
}

export interface CartItem {
  code: string;
  qty: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  remarks?: string;
  totalAmount: number;
  items: {
    product: Product;
    qty: number;
    lineTotal: number;
  }[];
}
