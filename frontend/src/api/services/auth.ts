import { apiClient } from '../client';

interface LoginRequest {
  email: string;
  password: string;
  tenantCode: string;
  branchId?: string;
}

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post('/auth/login', request);
  return data;
}
