// src/types/index.ts
export interface ProductImage {
  id: string;
  imagePath: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string;
  createdAt: string; // From API response
  category: number; // From API response
  sizes: string[];
  colors: string[];
  images: ProductImage[]; // Updated to match API response
  inStock: boolean; // Required by ProductCard and AppContext
  isAvailable?: boolean;
  isHidden?: boolean;
  isInstant?: boolean;
  isBreakfast?: boolean;
  isFeatured?: boolean;
  isOffer?: boolean; // Optional, used by ProductCard
  originalPrice?: number; // Optional, used by ProductCard
  rating?: number;
  salesCount?: number;
  type?: any;
  season?: any;
}

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  size?: string;
  color?: string;
  images?: {
    id: string;
    imagePath: string;
    isMain: boolean;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  // ... other customer properties
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  size: string;
  color: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  shippingFee: number;
  discountCode?: string | null;
  discountAmount?: number;
  paymentMethod: 'Cash' | 'Card' | 'OnlinePayment';
  status: OrderStatus;
  createdAt: string;
  customerInfo: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    governorate: string;
  };
}

export interface Admin {
  id: string;
  name: string;
  // ... other admin properties
}