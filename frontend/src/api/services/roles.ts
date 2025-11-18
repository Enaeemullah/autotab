import { apiClient } from '../client';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem?: boolean;
  permissions?: Permission[];
}

export interface RoleFilter {
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

export type RoleListResponse = PaginatedResponse<Role>;

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string | null;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  slug?: string;
  description?: string | null;
  permissionIds?: string[];
}

export async function fetchRoles(filter: RoleFilter = {}): Promise<RoleListResponse> {
  const { data } = await apiClient.get<RoleListResponse>('/roles', { params: filter });
  return data;
}

export async function fetchPermissions(): Promise<Permission[]> {
  const { data } = await apiClient.get<Permission[]>('/roles/permissions');
  return data;
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const { data } = await apiClient.post<Role>('/roles', input);
  return data;
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
  const { data } = await apiClient.put<Role>(`/roles/${id}`, input);
  return data;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}

