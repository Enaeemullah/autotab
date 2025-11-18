import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPaymentTypes,
  createPaymentType,
  updatePaymentType,
  deletePaymentType,
  type PaymentType,
  type CreatePaymentTypeInput,
  type UpdatePaymentTypeInput
} from '../../api/services/payment-types';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function PaymentTypesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);
  const queryClient = useQueryClient();

  const { data: paymentTypesData, isLoading } = useQuery({
    queryKey: ['paymentTypes', page, search],
    queryFn: () => fetchPaymentTypes({ page, limit: 25, search })
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createPaymentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentTypes'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTypes', 'active'] });
      setIsModalOpen(false);
      setEditingPaymentType(null);
      setError(null);
      setSuccess('Payment type created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to create payment type. Please try again.';
      setError(message);
      console.error('Create payment type error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentTypeInput }) =>
      updatePaymentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentTypes'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTypes', 'active'] });
      setIsModalOpen(false);
      setEditingPaymentType(null);
      setError(null);
      setSuccess('Payment type updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to update payment type. Please try again.';
      setError(message);
      console.error('Update payment type error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentTypes'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTypes', 'active'] });
      setError(null);
      setSuccess('Payment type deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to delete payment type. Please try again.';
      setError(message);
      console.error('Delete payment type error:', error);
    }
  });

  const handleOpenModal = (paymentType?: PaymentType) => {
    setEditingPaymentType(paymentType || null);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPaymentType(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment type?')) {
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
          <h1 className="text-2xl font-semibold text-slate-100">Payment Types</h1>
          <p className="text-sm text-slate-400">
            Configure payment methods available in your POS system.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
        >
          <PlusIcon className="h-5 w-5" />
          Add Payment Type
        </button>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Payment Types</h2>
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search payment types..."
            className="w-64 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400">Loading payment types...</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-center">Requires Reference</th>
                  <th className="px-4 py-3 text-center">Mark as Paid</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Sort Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                {paymentTypesData?.data?.length ? (
                  paymentTypesData.data.map((paymentType) => (
                    <tr key={paymentType.id} className="bg-slate-900/60">
                      <td className="px-4 py-3 font-medium">{paymentType.name}</td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                          {paymentType.code}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {paymentType.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {paymentType.requiresReference ? (
                          <span className="inline-flex rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-400">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {paymentType.markTransactionAsPaid ? (
                          <span className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {paymentType.isActive ? (
                          <span className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{paymentType.sortOrder}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(paymentType)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                            title="Edit Payment Type"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(paymentType.id)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                            title="Delete Payment Type"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                      No payment types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {paymentTypesData?.meta && paymentTypesData.meta.total > paymentTypesData.meta.limit && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Showing {(paymentTypesData.meta.page - 1) * paymentTypesData.meta.limit + 1} to{' '}
              {Math.min(paymentTypesData.meta.page * paymentTypesData.meta.limit, paymentTypesData.meta.total)} of{' '}
              {paymentTypesData.meta.total} payment types
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * paymentTypesData.meta.limit >= paymentTypesData.meta.total}
                className="rounded-md border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PaymentTypeModal
          paymentType={editingPaymentType}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            setError(null);
            if (editingPaymentType) {
              updateMutation.mutate({ id: editingPaymentType.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={error}
        />
      )}
    </div>
  );
}

interface PaymentTypeModalProps {
  paymentType: PaymentType | null;
  onClose: () => void;
  onSubmit: (data: CreatePaymentTypeInput | UpdatePaymentTypeInput) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function PaymentTypeModal({
  paymentType,
  onClose,
  onSubmit,
  isSubmitting,
  error
}: PaymentTypeModalProps) {
  const [formData, setFormData] = useState({
    name: paymentType?.name || '',
    code: paymentType?.code || '',
    description: paymentType?.description || '',
    icon: paymentType?.icon || '',
    isActive: paymentType?.isActive ?? true,
    requiresReference: paymentType?.requiresReference ?? false,
    sortOrder: paymentType?.sortOrder ?? 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      code: formData.code,
      description: formData.description || null,
      icon: formData.icon || null,
      isActive: formData.isActive,
      requiresReference: formData.requiresReference,
      markTransactionAsPaid: formData.markTransactionAsPaid,
      sortOrder: formData.sortOrder
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100">
            {paymentType ? 'Edit Payment Type' : 'Add Payment Type'}
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
                    setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                  placeholder="e.g., cash, card"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-slate-400">Lowercase, no spaces (use underscores)</p>
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
              <label className="mb-1 block text-sm font-medium text-slate-300">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., cash, credit-card, wallet"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-slate-400">Icon name (optional)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-slate-400">Lower numbers appear first</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-600 text-primary focus:ring-primary"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.requiresReference}
                    onChange={(e) =>
                      setFormData({ ...formData, requiresReference: e.target.checked })
                    }
                    className="rounded border-slate-600 text-primary focus:ring-primary"
                  />
                  Requires Reference
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.markTransactionAsPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, markTransactionAsPaid: e.target.checked })
                  }
                  className="rounded border-slate-600 text-primary focus:ring-primary"
                />
                Mark Transaction as Paid
                <span className="text-xs text-slate-500">
                  (If unchecked, user must enter payment amount in POS)
                </span>
              </label>
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
              {isSubmitting ? 'Saving...' : paymentType ? 'Update Payment Type' : 'Create Payment Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

