import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  createTenantAdmin,
  fetchAvailableFeatures,
  getTenantDetails,
  type Tenant,
  type CreateTenantInput,
  type UpdateTenantInput,
  type CreateTenantAdminInput,
  type TenantDetails
} from '../../api/services/tenants';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UserPlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export function TenantsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [viewingTenantId, setViewingTenantId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ['tenants', page, search],
    queryFn: () => fetchTenants({ page, limit: 25, search })
  });

  const { data: availableFeatures } = useQuery({
    queryKey: ['availableFeatures'],
    queryFn: fetchAvailableFeatures
  });

  const { data: tenantDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['tenantDetails', viewingTenantId],
    queryFn: () => getTenantDetails(viewingTenantId!),
    enabled: !!viewingTenantId && isDetailsModalOpen
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
      setEditingTenant(null);
      setError(null);
      setSuccess('Tenant created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to create tenant. Please try again.';
      setError(message);
      console.error('Create tenant error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantInput }) => updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
      setEditingTenant(null);
      setError(null);
      setSuccess('Tenant updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to update tenant. Please try again.';
      setError(message);
      console.error('Update tenant error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setError(null);
      setSuccess('Tenant deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to delete tenant. Please try again.';
      setError(message);
      console.error('Delete tenant error:', error);
    }
  });

  const createAdminMutation = useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: CreateTenantAdminInput }) =>
      createTenantAdmin(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsAdminModalOpen(false);
      setSelectedTenantId(null);
      setError(null);
      setSuccess('Admin user created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to create admin user. Please try again.';
      setError(message);
      console.error('Create admin error:', error);
    }
  });

  const handleOpenModal = (tenant?: Tenant) => {
    setEditingTenant(tenant || null);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
    setError(null);
  };

  const handleOpenAdminModal = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setIsAdminModalOpen(true);
    setError(null);
  };

  const handleCloseAdminModal = () => {
    setIsAdminModalOpen(false);
    setSelectedTenantId(null);
    setError(null);
  };

  const handleOpenDetailsModal = (tenantId: string) => {
    setViewingTenantId(tenantId);
    setIsDetailsModalOpen(true);
    setError(null);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingTenantId(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tenant? This will delete all associated data.')) {
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
          <h1 className="text-2xl font-semibold text-slate-100">Tenant Management</h1>
          <p className="text-sm text-slate-400">Manage organizations, allocate features, and create admins.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
        >
          <PlusIcon className="h-5 w-5" />
          Add Tenant
        </button>
      </header>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-4">
          <input
            type="text"
            placeholder="Search tenants by name, code, or email..."
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
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Features
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
                    Loading tenants...
                  </td>
                </tr>
              ) : tenantsData?.data?.length ? (
                tenantsData.data.map((tenant) => (
                  <tr key={tenant.id} className="bg-slate-900/60 hover:bg-slate-900/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{tenant.name}</div>
                      {tenant.contactEmail && (
                        <div className="text-xs text-slate-400">{tenant.contactEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-950 px-2 py-1 text-xs">{tenant.code}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tenant.config?.features?.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                          >
                            {feature}
                          </span>
                        ))}
                        {!tenant.config?.features?.length && (
                          <span className="text-xs text-slate-500">No features</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          tenant.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetailsModal(tenant.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAdminModal(tenant.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                          title="Create Admin"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(tenant)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                          title="Edit Tenant"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                          title="Delete Tenant"
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
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {tenantsData?.meta && tenantsData.meta.total > tenantsData.meta.limit && (
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>
                Showing {(page - 1) * tenantsData.meta.limit + 1} to{' '}
                {Math.min(page * tenantsData.meta.limit, tenantsData.meta.total)} of{' '}
                {tenantsData.meta.total} tenants
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
                  disabled={page * tenantsData.meta.limit >= tenantsData.meta.total}
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
        <TenantModal
          tenant={editingTenant}
          availableFeatures={availableFeatures || []}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            setError(null);
            if (editingTenant) {
              updateMutation.mutate({ id: editingTenant.id, data });
            } else {
              createMutation.mutate(data as CreateTenantInput);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={error}
        />
      )}

      {isAdminModalOpen && selectedTenantId && (
        <AdminModal
          tenantId={selectedTenantId}
          onClose={handleCloseAdminModal}
          onSubmit={(data) => {
            setError(null);
            createAdminMutation.mutate({ tenantId: selectedTenantId, data });
          }}
          isSubmitting={createAdminMutation.isPending}
          error={error}
        />
      )}

      {isDetailsModalOpen && viewingTenantId && (
        <TenantDetailsModal
          tenantDetails={tenantDetails}
          isLoading={isLoadingDetails}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
}

interface TenantModalProps {
  tenant: Tenant | null;
  availableFeatures: string[];
  onClose: () => void;
  onSubmit: (data: CreateTenantInput | UpdateTenantInput) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function TenantModal({
  tenant,
  availableFeatures,
  onClose,
  onSubmit,
  isSubmitting,
  error
}: TenantModalProps) {
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    code: tenant?.code || '',
    contactEmail: tenant?.contactEmail || '',
    contactPhone: tenant?.contactPhone || '',
    features: tenant?.config?.features || [],
    adminUser: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenant) {
      // Update: don't include adminUser
      onSubmit({
        name: formData.name,
        code: formData.code,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        features: formData.features
      });
    } else {
      // Create: include adminUser
      onSubmit({
        ...formData,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        adminUser: {
          ...formData.adminUser,
          phone: formData.adminUser.phone || null
        }
      });
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100">
            {tenant ? 'Edit Tenant' : 'Create Tenant'}
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
                <label className="mb-1 block text-sm font-medium text-slate-300">Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  placeholder="org-code"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Features</label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-slate-700 bg-slate-950 p-3">
                {availableFeatures.length ? (
                  availableFeatures.map((feature) => (
                    <label
                      key={feature}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded border-slate-600 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-200 capitalize">{feature.replace(/-/g, ' ')}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No features available</p>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {formData.features.length} feature{formData.features.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {!tenant && (
              <>
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="mb-4 text-lg font-semibold text-slate-100">Initial Admin User</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required={!tenant}
                          value={formData.adminUser.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminUser: { ...formData.adminUser, firstName: e.target.value }
                            })
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required={!tenant}
                          value={formData.adminUser.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminUser: { ...formData.adminUser, lastName: e.target.value }
                            })
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Email *</label>
                      <input
                        type="email"
                        required={!tenant}
                        value={formData.adminUser.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adminUser: { ...formData.adminUser, email: e.target.value }
                          })
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Password *</label>
                      <input
                        type="password"
                        required={!tenant}
                        minLength={8}
                        value={formData.adminUser.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adminUser: { ...formData.adminUser, password: e.target.value }
                          })
                        }
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Phone</label>
                      <input
                        type="tel"
                        value={formData.adminUser.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adminUser: { ...formData.adminUser, phone: e.target.value }
                          })
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-md border border-blue-500/50 bg-blue-500/10 p-3 text-sm text-blue-300">
                  <p>
                    <strong>Note:</strong> Default roles (Admin, Manager, Cashier) and permissions will be
                    automatically created for this tenant. The admin user will be assigned the Admin role.
                  </p>
                </div>
              </>
            )}
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
              {isSubmitting ? 'Saving...' : tenant ? 'Update Tenant' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AdminModalProps {
  tenantId: string;
  onClose: () => void;
  onSubmit: (data: CreateTenantAdminInput) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function AdminModal({ tenantId, onClose, onSubmit, isSubmitting, error }: AdminModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      phone: formData.phone || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Create Admin User</h2>
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
              <label className="mb-1 block text-sm font-medium text-slate-300">Password *</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
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
              {isSubmitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TenantDetailsModalProps {
  tenantDetails: TenantDetails | undefined;
  isLoading: boolean;
  onClose: () => void;
}

function TenantDetailsModal({ tenantDetails, isLoading, onClose }: TenantDetailsModalProps) {
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-6xl rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
          <div className="p-6 text-center text-slate-300">Loading tenant details...</div>
        </div>
      </div>
    );
  }

  if (!tenantDetails) {
    return null;
  }

  const { tenant, users, roles, permissions } = tenantDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-lg border border-slate-800 bg-slate-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{tenant.name}</h2>
            <p className="text-sm text-slate-400">Code: {tenant.code}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-slate-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Users Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Users ({users.length})</h3>
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Roles</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="bg-slate-900/60">
                      <td className="px-4 py-3 text-sm text-slate-200">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role.id}
                              className="inline-flex rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {user.branch ? user.branch.name : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roles Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Roles ({roles.length})</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{role.name}</span>
                      <code className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        {role.slug}
                      </code>
                      {role.isSystem && (
                        <span className="text-xs text-slate-500">(System)</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                      >
                        {perm.resource}:{perm.action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Permissions ({permissions.length})
            </h3>
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-wrap gap-2">
                {permissions.map((perm) => (
                  <span
                    key={perm.id}
                    className="inline-flex rounded bg-slate-800 px-2 py-1 text-xs text-slate-300"
                  >
                    {perm.resource}:{perm.action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 p-6">
          <button
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

