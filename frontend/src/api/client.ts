import axios, { AxiosHeaders } from 'axios';
import { store } from '../store';
import { logout, loginSuccess } from '../store/slices/authSlice';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  const headers = AxiosHeaders.from(config.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only set tenant headers if not superadmin
  const isSuperAdmin = state.auth.user?.roles?.includes('superadmin') || state.auth.user?.permissions?.includes('*');
  if (!isSuperAdmin && state.auth.tenant?.id) {
    headers.set('x-tenant-id', state.auth.tenant.id);
    headers.set('x-branch-id', state.auth.branchId ?? '');
  }

  config.headers = headers;
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error);
    }

    const state = store.getState();
    const refreshToken = state.auth.refreshToken;
    if (!refreshToken) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          const headers = AxiosHeaders.from(config.headers ?? {});
          headers.set('Authorization', `Bearer ${token}`);
          config.headers = headers;
          resolve(apiClient(config));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken
      });
      const { tokens, user } = response.data;
      store.dispatch(
        loginSuccess({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          branchId: state.auth.branchId,
          tenant: state.auth.tenant!,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: state.auth.user?.roles ?? [],
            permissions: state.auth.user?.permissions ?? []
          }
        })
      );
      onRefreshed(tokens.accessToken);
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
      config.headers = headers;
      return apiClient(config);
    } catch (refreshError) {
      store.dispatch(logout());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
