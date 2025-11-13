import { apiClient } from '../client';

export interface ProductFilter {
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchProducts(filter: ProductFilter = {}) {
  const { data } = await apiClient.get('/inventory/products', { params: filter });
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
