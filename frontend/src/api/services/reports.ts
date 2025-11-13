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
