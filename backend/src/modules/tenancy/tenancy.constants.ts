export type PermissionDefinition = {
  resource: string;
  action: string;
};

export type RoleSlug = 'admin' | 'manager' | 'cashier';

export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'update' },
  { resource: 'users', action: 'delete' },
  { resource: 'roles', action: 'read' },
  { resource: 'roles', action: 'create' },
  { resource: 'roles', action: 'update' },
  { resource: 'roles', action: 'delete' },
  { resource: 'products', action: 'read' },
  { resource: 'products', action: 'create' },
  { resource: 'products', action: 'update' },
  { resource: 'products', action: 'delete' },
  { resource: 'suppliers', action: 'read' },
  { resource: 'suppliers', action: 'create' },
  { resource: 'inventory', action: 'read' },
  { resource: 'inventory', action: 'create' },
  { resource: 'sales', action: 'read' },
  { resource: 'sales', action: 'create' },
  { resource: 'reports', action: 'read' },
  { resource: 'settings', action: 'read' },
  { resource: 'settings', action: 'update' },
  { resource: 'sync', action: 'read' },
  { resource: 'sync', action: 'write' }
];

export const ROLE_PERMISSION_MAP: Record<RoleSlug, PermissionDefinition[]> = {
  admin: DEFAULT_PERMISSIONS,
  manager: DEFAULT_PERMISSIONS.filter(
    (permission) =>
      !['users:delete', 'roles:delete', 'settings:update', 'sync:write'].includes(
        `${permission.resource}:${permission.action}`
      )
  ),
  cashier: [
    { resource: 'sales', action: 'read' },
    { resource: 'sales', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'inventory', action: 'read' },
    { resource: 'reports', action: 'read' }
  ]
};

export const ROLE_NAME_MAP: Record<RoleSlug, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  cashier: 'Cashier'
};
