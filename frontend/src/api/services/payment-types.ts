import { apiClient } from '../client';

export interface PaymentType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  requiresReference: boolean;
  markTransactionAsPaid: boolean;
  sortOrder: number;
}

export interface PaymentTypeFilter {
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

export type PaymentTypeListResponse = PaginatedResponse<PaymentType>;

export interface CreatePaymentTypeInput {
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
  requiresReference?: boolean;
  markTransactionAsPaid?: boolean;
  sortOrder?: number;
}

export interface UpdatePaymentTypeInput extends Partial<CreatePaymentTypeInput> {}

export async function fetchPaymentTypes(
  filter: PaymentTypeFilter = {}
): Promise<PaymentTypeListResponse> {
  const { data } = await apiClient.get<PaymentTypeListResponse>('/payment-types', {
    params: filter
  });
  return data;
}

export async function fetchActivePaymentTypes(): Promise<PaymentType[]> {
  const { data } = await apiClient.get<PaymentType[]>('/payment-types/active');
  return data;
}

export async function getPaymentType(id: string): Promise<PaymentType> {
  const { data } = await apiClient.get<PaymentType>(`/payment-types/${id}`);
  return data;
}

export async function createPaymentType(input: CreatePaymentTypeInput): Promise<PaymentType> {
  const { data } = await apiClient.post<PaymentType>('/payment-types', input);
  return data;
}

export async function updatePaymentType(
  id: string,
  input: UpdatePaymentTypeInput
): Promise<PaymentType> {
  const { data } = await apiClient.put<PaymentType>(`/payment-types/${id}`, input);
  return data;
}

export async function deletePaymentType(id: string): Promise<void> {
  await apiClient.delete(`/payment-types/${id}`);
}

