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

  if (!auth.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-transparent text-slate-100">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        >
          <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
        <Topbar />
        {isOffline ? <OfflineBadge /> : null}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
