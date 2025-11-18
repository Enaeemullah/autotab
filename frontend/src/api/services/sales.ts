import { apiClient } from '../client';

export interface SalePayload {
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    batchId?: string;
    quantity: number;
    unitPrice: number;
    discountRate?: number;
    taxRate?: number;
  }>;
  payments: Array<{
    paymentTypeId: string;
    amount: number;
    reference?: string;
  }>;
}

export async function createSale(payload: SalePayload) {
  const { data } = await apiClient.post('/sales', payload);
  return data;
}

export async function fetchSales(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get('/sales', { params });
  return data;
}
