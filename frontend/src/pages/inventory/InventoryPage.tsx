import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, fetchSuppliers } from '../../api/services/inventory';

export function InventoryPage() {
  const [search, setSearch] = useState('');
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

  return (
    <div className="space-y-6">
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
          <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/80">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Loading products…
                    </td>
                  </tr>
                ) : products?.data?.length ? (
                  products.data.map((product: any) => (
                    <tr key={product.id} className="bg-slate-900/60">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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
    </div>
  );
}
