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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  branchId?: string | null;
  roles?: Role[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFilter {
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

export type UserListResponse = PaginatedResponse<User>;

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  branchId?: string | null;
  roleIds?: string[];
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  branchId?: string | null;
  roleIds?: string[];
}

export async function fetchUsers(filter: UserFilter = {}): Promise<UserListResponse> {
  const { data } = await apiClient.get<UserListResponse>('/users', { params: filter });
  return data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await apiClient.post<User>('/users', input);
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const { data } = await apiClient.put<User>(`/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

