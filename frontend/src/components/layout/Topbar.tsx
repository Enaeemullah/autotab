import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, PowerIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { apiClient } from '../../api/client';

interface Branch {
  id: string;
  name: string;
  code: string;
}

export function Topbar() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const initials = useMemo(() => {
    const first = auth.user?.firstName?.[0] ?? '';
    const last = auth.user?.lastName?.[0] ?? '';
    const combined = `${first}${last}`.trim();
    return combined || 'AU';
  }, [auth.user?.firstName, auth.user?.lastName]);

  useEffect(() => {
    async function loadBranches() {
      if (!auth.tenant?.id) return;
      try {
        const { data } = await apiClient.get<Branch[]>('/tenancy/branches');
        setBranches(data);
      } catch (error) {
        console.error('Failed to load branches', error);
      }
    }
    loadBranches();
  }, [auth.tenant?.id]);

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/40 px-4 py-4 backdrop-blur-xl sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Active tenant</p>
        <h2 className="text-2xl font-semibold text-white">
          {auth.tenant?.name ?? 'Autotab POS'}
        </h2>
        <p className="text-sm text-slate-400">
          Branch:{' '}
          {branches.find((branch) => branch.id === auth.branchId)?.name ?? 'All locations'}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
        <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search products, customers, or reports"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <PlusIcon className="h-4 w-4" />
            New sale
          </Link>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold uppercase text-primary">
              {initials}
            </div>
            <div className="hidden text-right text-xs text-slate-300 sm:block">
              <p className="font-semibold text-white">
                {auth.user?.firstName} {auth.user?.lastName}
              </p>
              <p className="text-slate-400">{auth.user?.roles?.join(', ') ?? '—'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/30 hover:text-white"
          >
            <PowerIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
