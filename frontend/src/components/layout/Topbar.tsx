import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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

  const isSuperAdmin = auth.user?.roles?.includes('superadmin') || auth.user?.permissions?.includes('*');

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          {isSuperAdmin ? 'Superadmin Panel' : auth.tenant?.name ?? 'Autotab POS'}
        </h2>
        {!isSuperAdmin && (
          <p className="text-sm text-slate-400">
            Branch:{' '}
            {branches.find((branch) => branch.id === auth.branchId)?.name ?? 'All locations'}
          </p>
        )}
        {isSuperAdmin && (
          <p className="text-sm text-slate-400">Manage all tenants and organizations</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium text-slate-200">
            {auth.user?.firstName} {auth.user?.lastName}
          </span>
          <span className="text-xs text-slate-400">{auth.user?.roles.join(', ')}</span>
        </div>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          Logout
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
