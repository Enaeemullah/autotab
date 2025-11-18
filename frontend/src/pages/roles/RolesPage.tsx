import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  type Role,
  type Permission,
  type CreateRoleInput,
  type UpdateRoleInput
} from '../../api/services/roles';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function RolesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles', page, search],
    queryFn: () => fetchRoles({ page, limit: 25, search })
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsModalOpen(false);
      setEditingRole(null);
      setError(null);
      setSuccess('Role created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to create role. Please try again.';
      setError(message);
      console.error('Create role error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsModalOpen(false);
      setEditingRole(null);
      setError(null);
      setSuccess('Role updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to update role. Please try again.';
      setError(message);
      console.error('Update role error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setError(null);
      setSuccess('Role deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to delete role. Please try again.';
      setError(message);
      console.error('Delete role error:', error);
    }
  });

  const handleOpenModal = (role?: Role) => {
    setEditingRole(role || null);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteMutation.mutate(id);
    }
  };

  const groupedPermissions = permissions?.reduce((acc, perm) => {
    const resource = perm.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>) || {};

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-400">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-400 hover:text-green-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Role Management</h1>
          <p className="text-sm text-slate-400">Manage roles and assign permissions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
        >
          <PlusIcon className="h-5 w-5" />
          Add Role
        </button>
      </header>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-4">
          <input
            type="text"
            placeholder="Search roles by name or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Permissions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Loading roles...
                  </td>
                </tr>
              ) : rolesData?.data?.length ? (
                rolesData.data.map((role) => (
                  <tr key={role.id} className="bg-slate-900/60 hover:bg-slate-900/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{role.name}</div>
                      {role.description && (
                        <div className="text-xs text-slate-400">{role.description}</div>
                      )}
                      {role.isSystem && (
                        <span className="mt-1 inline-block text-xs text-slate-500">(System)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <code className="rounded bg-slate-950 px-2 py-1 text-xs">{role.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((perm) => (
                          <span
                            key={perm.id}
                            className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                          >
                            {perm.resource}:{perm.action}
                          </span>
                        ))}
                        {role.permissions && role.permissions.length > 3 && (
                          <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                        {!role.permissions?.length && (
                          <span className="text-xs text-slate-500">No permissions</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          disabled={role.isSystem}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={role.isSystem ? 'System roles cannot be deleted' : 'Delete role'}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {rolesData?.meta && rolesData.meta.total > rolesData.meta.limit && (
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>
                Showing {(page - 1) * rolesData.meta.limit + 1} to{' '}
                {Math.min(page * rolesData.meta.limit, rolesData.meta.total)} of{' '}
                {rolesData.meta.total} roles
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-slate-700 px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * rolesData.meta.limit >= rolesData.meta.total}
                  className="rounded-md border border-slate-700 px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RoleModal
          role={editingRole}
          permissions={permissions || []}
          groupedPermissions={groupedPermissions}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            setError(null);
            if (editingRole) {
              updateMutation.mutate({ id: editingRole.id, data });
            } else {
              createMutation.mutate(data as CreateRoleInput);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={error}
        />
      )}
    </div>
  );
}

interface RoleModalProps {
  role: Role | null;
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  onClose: () => void;
  onSubmit: (data: CreateRoleInput | UpdateRoleInput) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function RoleModal({
  role,
  permissions,
  groupedPermissions,
  onClose,
  onSubmit,
  isSubmitting,
  error
}: RoleModalProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    slug: role?.slug || '',
    description: role?.description || '',
    permissionIds: role?.permissions?.map((p) => p.id) || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      description: formData.description || null
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  const toggleResource = (resource: string) => {
    const resourcePerms = groupedPermissions[resource] || [];
    const allSelected = resourcePerms.every((perm) => formData.permissionIds.includes(perm.id));
    
    if (allSelected) {
      // Deselect all permissions for this resource
      setFormData((prev) => ({
        ...prev,
        permissionIds: prev.permissionIds.filter(
          (id) => !resourcePerms.some((perm) => perm.id === id)
        )
      }));
    } else {
      // Select all permissions for this resource
      const newIds = resourcePerms.map((perm) => perm.id);
      setFormData((prev) => ({
        ...prev,
        permissionIds: [...new Set([...prev.permissionIds, ...newIds])]
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100">
            {role ? 'Edit Role' : 'Create Role'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-slate-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., custom-role"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Permissions</label>
              <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border border-slate-700 bg-slate-950 p-4">
                {Object.keys(groupedPermissions).length ? (
                  Object.entries(groupedPermissions).map(([resource, perms]) => {
                    const allSelected = perms.every((perm) =>
                      formData.permissionIds.includes(perm.id)
                    );
                    const someSelected = perms.some((perm) =>
                      formData.permissionIds.includes(perm.id)
                    );

                    return (
                      <div key={resource} className="space-y-2 rounded-md border border-slate-800 p-3">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(input) => {
                              if (input) input.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={() => toggleResource(resource)}
                            className="rounded border-slate-600 text-primary focus:ring-primary"
                          />
                          <span className="font-semibold capitalize text-slate-200">
                            {resource}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({perms.length} permission{perms.length !== 1 ? 's' : ''})
                          </span>
                        </label>
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissionIds.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="rounded border-slate-600 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-slate-300">{perm.action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No permissions available</p>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {formData.permissionIds.length} permission{formData.permissionIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

