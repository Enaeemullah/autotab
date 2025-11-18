import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  type Role
} from '../../api/services/users';
import { fetchRoles } from '../../api/services/roles';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => fetchUsers({ page, limit: 25, search })
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchRoles({ limit: 100 })
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      setError(null);
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to create user. Please try again.';
      setError(message);
      console.error('Create user error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      setError(null);
      setSuccess('User updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to update user. Please try again.';
      setError(message);
      console.error('Update user error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(null);
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to delete user. Please try again.';
      setError(message);
      console.error('Delete user error:', error);
    }
  });

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

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
          <h1 className="text-2xl font-semibold text-slate-100">User Management</h1>
          <p className="text-sm text-slate-400">Manage users, roles, and permissions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
        >
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </header>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
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
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Roles
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : usersData?.data?.length ? (
                usersData.data.map((user) => (
                  <tr key={user.id} className="bg-slate-900/60 hover:bg-slate-900/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                          >
                            {role.name}
                          </span>
                        ))}
                        {!user.roles?.length && (
                          <span className="text-xs text-slate-500">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : user.status === 'inactive'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {usersData?.meta && usersData.meta.total > usersData.meta.limit && (
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>
                Showing {(page - 1) * usersData.meta.limit + 1} to{' '}
                {Math.min(page * usersData.meta.limit, usersData.meta.total)} of{' '}
                {usersData.meta.total} users
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
                  disabled={page * usersData.meta.limit >= usersData.meta.total}
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
        <UserModal
          user={editingUser}
          roles={rolesData?.data || []}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            setError(null);
            if (editingUser) {
              updateMutation.mutate({ id: editingUser.id, data });
            } else {
              createMutation.mutate(data as CreateUserInput);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={error}
        />
      )}
    </div>
  );
}

interface UserModalProps {
  user: User | null;
  roles: Role[];
  onClose: () => void;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function UserModal({ user, roles, onClose, onSubmit, isSubmitting, error }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    branchId: user?.branchId || null,
    roleIds: user?.roles?.map((r) => r.id) || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = user
      ? { ...formData, password: formData.password || undefined }
      : { ...formData, password: formData.password };
    onSubmit(data);
  };

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100">
            {user ? 'Edit User' : 'Create User'}
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
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Password {user ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                required={!user}
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Roles</label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-slate-700 bg-slate-950 p-3">
                {roles.length ? (
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        className="rounded border-slate-600 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-200">{role.name}</span>
                      {role.isSystem && (
                        <span className="text-xs text-slate-500">(System)</span>
                      )}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No roles available</p>
                )}
              </div>
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
              {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

