import { NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../../store/hooks';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'POS', to: '/pos', icon: ShoppingCartIcon },
  { name: 'Inventory', to: '/inventory', icon: ShoppingBagIcon },
  { name: 'Reports', to: '/reports', icon: ChartBarIcon },
  { name: 'Users', to: '/users', icon: UserGroupIcon },
  { name: 'Roles', to: '/roles', icon: ShieldCheckIcon },
  { name: 'Payment Types', to: '/payment-types', icon: CreditCardIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
];

const superadminNavigation = [
  { name: 'Tenants', to: '/tenants', icon: BuildingOfficeIcon }
];

export function Sidebar() {
  const auth = useAppSelector((state) => state.auth);
  const isSuperAdmin = auth.user?.roles?.includes('superadmin') || auth.user?.permissions?.includes('*');

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/70 p-4 md:flex md:flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-primary">autotab</h1>
        <p className="text-sm text-slate-400">
          {isSuperAdmin ? 'Superadmin Panel' : 'Offline-first POS'}
        </p>
      </div>
      <nav className="flex flex-1 flex-col space-y-1">
        {isSuperAdmin && (
          <>
            {superadminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
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
            <div className="my-2 border-t border-slate-800"></div>
          </>
        )}
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
