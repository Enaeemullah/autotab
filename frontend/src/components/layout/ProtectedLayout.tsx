import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OfflineBadge } from './OfflineBadge';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function ProtectedLayout() {
  const auth = useAppSelector((state) => state.auth);
  const location = useLocation();
  const { isOffline } = useNetworkStatus();
  const isSuperAdmin = auth.user?.roles?.includes('superadmin') || auth.user?.permissions?.includes('*');

  if (!auth.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin doesn't need tenant context
  if (!isSuperAdmin && !auth.tenant) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        {isOffline ? <OfflineBadge /> : null}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
