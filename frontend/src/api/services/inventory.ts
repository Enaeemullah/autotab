import { apiClient } from '../client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  salePrice?: number;
  sale_price?: number;
  taxRate?: number;
  tax_rate?: number;
  currentStock?: number;
  current_stock?: number;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export type ProductListResponse = PaginatedResponse<Product>;

export async function fetchProducts(filter: ProductFilter = {}): Promise<ProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>('/inventory/products', { params: filter });
  return data;
}

export async function fetchCategories() {
  const { data } = await apiClient.get('/inventory/categories');
  return data;
}

export async function fetchSuppliers() {
  const { data } = await apiClient.get('/inventory/suppliers');
  return data;
}

export async function fetchStockLocations() {
  const { data } = await apiClient.get('/inventory/stock-locations');
  return data;
}
