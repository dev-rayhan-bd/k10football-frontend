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

