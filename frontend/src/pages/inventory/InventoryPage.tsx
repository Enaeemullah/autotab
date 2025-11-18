import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchCategories,
  fetchSuppliers,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type CreateProductInput,
  type UpdateProductInput,
  type Category,
  type Supplier
} from '../../api/services/inventory';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => fetchProducts({ search, limit: 50 })
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      setError(null);
      setSuccess('Product created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to create product. Please try again.';
      setError(message);
      console.error('Create product error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      setError(null);
      setSuccess('Product updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to update product. Please try again.';
      setError(message);
      console.error('Update product error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setError(null);
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        'Failed to delete product. Please try again.';
      setError(message);
      console.error('Delete product error:', error);
    }
  });

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-400">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Inventory</h1>
          <p className="text-sm text-slate-400">
            Manage products, categories, suppliers, and stock locations.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-primary">
            Import CSV
          </button>
          <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-primary">
            Export CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/80"
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        <section className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Products</h2>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-64 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Stock</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Loading products…
                    </td>
                  </tr>
                ) : products?.data?.length ? (
                  products.data.map((product: any) => (
                    <tr key={product.id} className="bg-slate-900/60 hover:bg-slate-900/80">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-slate-400">{product.sku}</div>
                      </td>
                      <td className="px-4 py-3">{product.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {Number(product.currentStock ?? product.current_stock ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${Number(product.salePrice ?? product.sale_price ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-primary"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                            title="Delete Product"
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
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Categories
            </h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {categories?.map((category: any) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between rounded-md bg-slate-950/40 px-3 py-2"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-slate-400">
                    {(category.products?.length ?? 0) || '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Suppliers
            </h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {suppliers?.map((supplier: any) => (
                <li key={supplier.id} className="rounded-md bg-slate-950/40 px-3 py-2">
                  <p className="font-medium">{supplier.name}</p>
                  <p className="text-xs text-slate-400">{supplier.email ?? supplier.phone}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories || []}
          suppliers={suppliers || []}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            setError(null);
            if (editingProduct) {
              updateMutation.mutate({ id: editingProduct.id, data });
            } else {
              createMutation.mutate(data as CreateProductInput);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={error}
        />
      )}
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  onSubmit: (data: CreateProductInput | UpdateProductInput) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function ProductModal({
  product,
  categories,
  suppliers,
  onClose,
  onSubmit,
  isSubmitting,
  error
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    name: product?.name || '',
    description: product?.description || '',
    costPrice: product?.costPrice || product?.cost_price || 0,
    salePrice: product?.salePrice || product?.sale_price || 0,
    taxRate: product?.taxRate || product?.tax_rate || 0,
    reorderPoint: product?.reorderPoint || product?.reorder_point || 0,
    unit: product?.unit || 'unit',
    categoryId: (product as any)?.category?.id || (product as any)?.categoryId || '',
    supplierId: (product as any)?.supplier?.id || (product as any)?.supplierId || '',
    isBatchTracked: product?.isBatchTracked || (product as any)?.is_batch_tracked || false,
    expiryTracking: product?.expiryTracking || (product as any)?.expiry_tracking || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      barcode: formData.barcode || null,
      description: formData.description || null,
      categoryId: formData.categoryId || null,
      supplierId: formData.supplierId || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-100">
            {product ? 'Edit Product' : 'Create Product'}
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
                <label className="mb-1 block text-sm font-medium text-slate-300">SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Cost Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Sale Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Reorder Point</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="unit">Unit</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="l">Liter</option>
                  <option value="ml">Milliliter</option>
                  <option value="m">Meter</option>
                  <option value="cm">Centimeter</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isBatchTracked}
                  onChange={(e) => setFormData({ ...formData, isBatchTracked: e.target.checked })}
                  className="rounded border-slate-600 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-300">Batch Tracked</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.expiryTracking}
                  onChange={(e) => setFormData({ ...formData, expiryTracking: e.target.checked })}
                  className="rounded border-slate-600 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-300">Expiry Tracking</span>
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
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
