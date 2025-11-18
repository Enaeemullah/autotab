import { apiClient } from '../client';

interface LoginRequest {
  email: string;
  password: string;
  tenantCode: string; // Required - "autotab" is used for superadmin login
  branchId?: string;
}

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post('/auth/login', request);
  return data;
}
