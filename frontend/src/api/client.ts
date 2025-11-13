import axios from 'axios';
import { store } from '../store';
import { logout, loginSuccess } from '../store/slices/authSlice';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  if (state.auth.tenant?.id) {
    config.headers = {
      ...config.headers,
      'x-tenant-id': state.auth.tenant.id,
      'x-branch-id': state.auth.branchId ?? ''
    };
  }
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
    if (!response || response.status !== 401) {
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
          config.headers.Authorization = `Bearer ${token}`;
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
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(config);
    } catch (refreshError) {
      store.dispatch(logout());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
