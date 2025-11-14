import { useState, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { login } from '../../api/services/auth';
import { useAppDispatch } from '../../store/hooks';
import { loginSuccess } from '../../store/slices/authSlice';

type LoginPayload = {
  email: string;
  password: string;
  tenantCode: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

type LoginResponse = Awaited<ReturnType<typeof login>>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
    tenantCode: ''
  });
  const [clientError, setClientError] = useState<string | null>(null);

  const { mutateAsync, isPending, error: mutationError } = useMutation<
    LoginResponse,
    AxiosError<ApiErrorResponse>,
    LoginPayload
  >({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(
        loginSuccess({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          branchId: data.branchId ?? null,
          tenant: data.tenant,
          user: data.user
        })
      );
    }
  });

  const serverErrorMessage = useMemo(() => {
    if (!mutationError) {
      return null;
    }
    return (
      mutationError.response?.data?.message ??
      mutationError.response?.data?.errors?.[0]?.message ??
      'Unable to sign in. Please verify your credentials.'
    );
  }, [mutationError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    const tenantCode = form.tenantCode.trim().toLowerCase();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!tenantCode || !email || !password) {
      setClientError('Please complete all required fields.');
      return;
    }

    try {
      const result = await mutateAsync({
        email,
        password,
        tenantCode
      });

      if (result) {
        const from =
          (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ??
          '/';
        navigate(from, { replace: true });
      }
    } catch {
      // handled via mutation state
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const activeError = clientError ?? serverErrorMessage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 lg:flex-row lg:items-center lg:py-20">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-100/80 bg-white/80 px-4 py-2 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            Retail OS by Autotab
          </div>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Welcome back</p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
              Command your operations with{' '}
              <span className="text-primary">clarity and control.</span>
            </h1>
            <p className="text-lg text-slate-600">
              Sign in to review live revenue, orchestrate inventory, and keep every branch in sync
              with a workspace engineered for modern retail teams.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Centralized tenant management',
              'Auditable role-based access',
              'Inventory health at a glance',
              'Resilient offline POS'
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  •
                </span>
                {benefit}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_40px_80px_-40px_rgba(220,38,38,0.45)] lg:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.4em] text-primary/70">
                Secure access
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Sign in to Autotab</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use your workspace credentials to continue
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="tenantCode">
                  Tenant code
                </label>
                <input
                  id="tenantCode"
                  name="tenantCode"
                  value={form.tenantCode}
                  onChange={handleChange}
                  autoComplete="organization"
                  required
                  placeholder="demo-retail"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-slate-500">Min. 6 characters</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {activeError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700"
                >
                  {activeError}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={isPending}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-base font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                {isPending ? 'Signing you in…' : 'Sign in securely'}
                <span
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
              <p className="text-center text-xs text-slate-500">
                Need an account? Contact your Autotab administrator.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
