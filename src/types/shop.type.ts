/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IProductItem {
  _id: string;
  id?: string | number;
  productName: string;
  slug?: string;
  category: string;
  sku?: string;
  regularPrice: number;
  salePrice?: number;
  productDescription?: string;
  availableSizes?: string[];
  availableColors?: string[];
  stockQuantity: number;
  minStockLevel?: number;
  maxOrderQuantity?: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | string;
  productImage?: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  title?: string;
  price?: number;
  description?: string;
  image?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface IProductStats {
  totalProducts: number;
  inStockCount: number;
  outOfStockCount: number;
  categories: {
    name: string;
    slug: string;
  }[];
}

export interface IProductMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IProductsResponseData {
  products: IProductItem[];
  stats: IProductStats;
  meta: IProductMeta;
  categories?: string[];
}

export interface IGetProductsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IProductsResponseData;
}

export interface IProductCategoryItem {
  name: string;
  slug: string;
}

export interface IGetProductCategoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IProductCategoryItem[];
}

export interface IGetProductsParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface IProductFormData {
  productName: string;
  category: string;
  sku: string;
  regularPrice: string | number;
  salePrice: string | number;
  productDescription: string;
  availableSizes: string[];
  availableColors: string[];
  stockQuantity: string | number;
  minStockLevel: string | number;
  maxOrderQuantity: string | number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface ICartItemProduct {
  _id: string;
  productName: string;
  slug?: string;
  category?: string;
  regularPrice?: number;
  salePrice?: number;
  price?: number;
  productImage?: string;
  images?: string[];
  stockQuantity?: number;
  stockStatus?: string;
  [key: string]: any;
}

export interface ICartItem {
  _id: string;
  productId: string | ICartItemProduct;
  product?: ICartItemProduct;
  quantity: number;
  size: string;
  price: number;
  subtotal?: number;
}

export interface ICartData {
  _id: string;
  userId?: string;
  items: ICartItem[];
  itemCount: number;
  subtotal: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetCartResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ICartData;
}

export interface IAddToCartPayload {
  productId: string;
  quantity: number;
  size: string;
}

export interface IUpdateCartItemPayload {
  itemId: string;
  quantity: number;
  size?: string;
}

export interface IOrderItem {
  productId: string | IProductItem | any;
  quantity: number;
  price: number;
  size: string;
  _id?: string;
}

export interface IOrderData {
  _id: string;
  userId: string;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | string;
  orderStatus: "PROCESSING" | "COMPLETED" | "CANCELLED" | string;
  stripeSessionId?: string;
  sessionId?: string;
  checkoutUrl?: string;
  shippingAddress?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ICreateOrderPayload {
  shippingAddress?: string;
  [key: string]: any;
}

export interface ICreateOrderResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IOrderData;
}

export interface IVerifyOrderResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IOrderData;
}

export interface IGetMyOrdersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IOrderData[];
}



