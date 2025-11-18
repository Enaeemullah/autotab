import { apiClient } from '../client';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
  config?: {
    features?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  branches?: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  timezone: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface TenantFilter {
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

export type TenantListResponse = PaginatedResponse<Tenant>;

export interface CreateTenantInput {
  name: string;
  code: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  features?: string[];
  adminUser: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
}

export interface UpdateTenantInput {
  name?: string;
  code?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  features?: string[];
}

export interface CreateTenantAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export async function fetchTenants(filter: TenantFilter = {}): Promise<TenantListResponse> {
  const { data } = await apiClient.get<TenantListResponse>('/tenancy/management/tenants', {
    params: filter
  });
  return data;
}

export async function getTenant(id: string): Promise<Tenant> {
  const { data } = await apiClient.get<Tenant>(`/tenancy/management/tenants/${id}`);
  return data;
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const { data } = await apiClient.post<Tenant>('/tenancy/management/tenants', input);
  return data;
}

export async function updateTenant(id: string, input: UpdateTenantInput): Promise<Tenant> {
  const { data } = await apiClient.put<Tenant>(`/tenancy/management/tenants/${id}`, input);
  return data;
}

export async function deleteTenant(id: string): Promise<void> {
  await apiClient.delete(`/tenancy/management/tenants/${id}`);
}

export async function createTenantAdmin(
  tenantId: string,
  input: CreateTenantAdminInput
): Promise<any> {
  const { data } = await apiClient.post(`/tenancy/management/tenants/${tenantId}/admins`, input);
  return data;
}

export async function fetchAvailableFeatures(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/tenancy/management/features');
  return data;
}

export interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  roles: Array<{ id: string; name: string; slug: string }>;
  branch: { id: string; name: string; code: string } | null;
}

export interface TenantRole {
  id: string;
  name: string;
  slug: string;
  isSystem: boolean;
  permissions: Array<{ id: string; name: string; resource: string; action: string }>;
}

export interface TenantPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface TenantDetails {
  tenant: Tenant;
  users: TenantUser[];
  roles: TenantRole[];
  permissions: TenantPermission[];
}

export async function getTenantDetails(id: string): Promise<TenantDetails> {
  const { data } = await apiClient.get<TenantDetails>(`/tenancy/management/tenants/${id}/details`);
  return data;
}

