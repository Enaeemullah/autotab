import { NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'POS', to: '/pos', icon: ShoppingCartIcon },
  { name: 'Inventory', to: '/inventory', icon: ShoppingBagIcon },
  { name: 'Reports', to: '/reports', icon: ChartBarIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
];

export function Sidebar() {
  return (
    <aside className="relative hidden min-h-screen w-72 flex-shrink-0 border-r border-white/10 bg-slate-950/40 px-6 py-8 backdrop-blur-xl md:flex md:flex-col">
      <div className="mb-10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-lg font-bold uppercase text-primary">
            A
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              Autotab
            </p>
            <p className="text-lg font-semibold text-white">Command Center</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">Monitor revenue, inventory, and operations in one view.</p>
      </div>
      <nav className="flex flex-1 flex-col space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/10 text-white shadow-[0_15px_40px_-20px_rgba(220,38,38,0.8)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-base transition ${
                    isActive
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-white/5 bg-white/5 text-slate-400 group-hover:border-white/20 group-hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <span>{item.name}</span>
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 right-2 w-px rounded-full bg-gradient-to-b from-primary/80 via-white/40 to-primary/60"
                  />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-10 space-y-3 text-sm text-slate-400">
        <p className="pill w-fit border-primary/30 bg-primary/10 text-primary">Live Sync</p>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Status</p>
          <p className="mt-2 text-sm font-medium text-white">Operational</p>
          <p className="text-xs text-slate-500">Offline cache healthy</p>
        </div>
      </div>
    </aside>
  );
}
