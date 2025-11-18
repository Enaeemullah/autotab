import { apiClient } from '../client';

export async function fetchDashboard() {
  const { data } = await apiClient.get('/reports/dashboard');
  return data;
}

export async function fetchSalesReport(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const { data } = await apiClient.get('/reports/sales', { params: { period } });
  return data;
}

export async function fetchInventoryReport() {
  const { data } = await apiClient.get('/reports/inventory');
  return data;
}

export async function fetchUserPerformance() {
  const { data } = await apiClient.get('/reports/user-performance');
  return data;
}

export interface MonthlySalesData {
  month: string;
  monthNumber: number;
  totalSales: number;
  transactions: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  quantitySold: number;
  totalSales: number;
}

export interface HourlySalesData {
  hour: number;
  totalSales: number;
  transactions: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string | null;
  purchaseCount: number;
  totalSpent: number;
}

export interface TopProductGroup {
  id: string;
  name: string;
  quantitySold: number;
  totalSales: number;
}

export interface PeriodicSales {
  totalSales: number;
  totalTax: number;
  transactions: number;
}

export async function fetchMonthlySales(year?: number): Promise<MonthlySalesData[]> {
  const { data } = await apiClient.get<MonthlySalesData[]>('/reports/monthly-sales', {
    params: { year: year || new Date().getFullYear() }
  });
  return data;
}

export async function fetchTopProducts(
  startDate: string,
  endDate: string,
  limit: number = 5
): Promise<TopProduct[]> {
  const { data } = await apiClient.get<TopProduct[]>('/reports/top-products', {
    params: { startDate, endDate, limit }
  });
  return data;
}

export async function fetchHourlySales(
  startDate: string,
  endDate: string
): Promise<HourlySalesData[]> {
  const { data } = await apiClient.get<HourlySalesData[]>('/reports/hourly-sales', {
    params: { startDate, endDate }
  });
  return data;
}

export async function fetchTopCustomers(
  startDate: string,
  endDate: string,
  limit: number = 5
): Promise<TopCustomer[]> {
  const { data } = await apiClient.get<TopCustomer[]>('/reports/top-customers', {
    params: { startDate, endDate, limit }
  });
  return data;
}

export async function fetchTopProductGroups(
  startDate: string,
  endDate: string,
  limit: number = 5
): Promise<TopProductGroup[]> {
  const { data } = await apiClient.get<TopProductGroup[]>('/reports/top-product-groups', {
    params: { startDate, endDate, limit }
  });
  return data;
}

export async function fetchPeriodicSales(
  startDate: string,
  endDate: string
): Promise<PeriodicSales> {
  const { data } = await apiClient.get<PeriodicSales>('/reports/periodic-sales', {
    params: { startDate, endDate }
  });
  return data;
}