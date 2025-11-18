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

export interface CreateProductInput {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  costPrice: number;
  salePrice: number;
  taxRate: number;
  reorderPoint?: number;
  unit?: string;
  categoryId?: string | null;
  supplierId?: string | null;
  isBatchTracked?: boolean;
  expiryTracking?: boolean;
  variants?: Array<{
    name: string;
    sku: string;
    barcode?: string | null;
    salePrice: number;
    costPrice: number;
    attributes?: Record<string, string>;
  }>;
  batches?: Array<{
    batchCode: string;
    manufacturedAt?: string | null;
    expiresAt?: string | null;
    quantity: number;
  }>;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>('/inventory/products', input);
  return data;
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/inventory/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/inventory/products/${id}`);
}