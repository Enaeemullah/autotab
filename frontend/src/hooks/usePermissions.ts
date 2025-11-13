import { useAppSelector } from '../store/hooks';

export function usePermissions() {
  const permissions = useAppSelector((state) => state.auth.user?.permissions ?? []);
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);

  const hasPermission = (permission: string) => permissions.includes(permission);
  const hasRole = (role: string) => roles.includes(role);

  return { permissions, roles, hasPermission, hasRole };
}
