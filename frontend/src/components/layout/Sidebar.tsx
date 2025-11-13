import { NavLink } from 'react-router-dom';
import { ChartBarIcon, Cog6ToothIcon, HomeIcon, ShoppingBagIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'POS', to: '/pos', icon: ShoppingCartIcon },
  { name: 'Inventory', to: '/inventory', icon: ShoppingBagIcon },
  { name: 'Reports', to: '/reports', icon: ChartBarIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/70 p-4 md:flex md:flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-primary">autotab</h1>
        <p className="text-sm text-slate-400">Offline-first POS</p>
      </div>
      <nav className="flex flex-1 flex-col space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-primary/20 text-primary' : 'text-slate-300 hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
