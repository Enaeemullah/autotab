import { Routes, Route } from 'react-router-dom';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { POSPage } from './pages/pos/POSPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { UsersPage } from './pages/users/UsersPage';
import { RolesPage } from './pages/roles/RolesPage';
import { TenantsPage } from './pages/tenants/TenantsPage';
import { PaymentTypesPage } from './pages/payment-types/PaymentTypesPage';
import { LoginPage } from './pages/auth/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/payment-types" element={<PaymentTypesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
