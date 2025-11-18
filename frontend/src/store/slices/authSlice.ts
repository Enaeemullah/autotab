import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

interface TenantInfo {
  id: string;
  name: string;
  code: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tenant: TenantInfo | null;
  branchId: string | null;
  user: AuthUser | null;
  isOffline: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tenant: null,
  branchId: null,
  user: null,
  isOffline: false
};

interface LoginSuccessPayload {
  accessToken: string;
  refreshToken: string;
  tenant: TenantInfo | null;
  branchId: string | null;
  user: AuthUser;
  isSuperAdmin?: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<LoginSuccessPayload>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.tenant = action.payload.tenant;
      state.branchId = action.payload.branchId;
      state.user = action.payload.user;
    },
    logout() {
      return initialState;
    },
    setOffline(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    setBranch(state, action: PayloadAction<string | null>) {
      state.branchId = action.payload;
    }
  }
});

export const { loginSuccess, logout, setOffline, setBranch } = authSlice.actions;
export default authSlice.reducer;
