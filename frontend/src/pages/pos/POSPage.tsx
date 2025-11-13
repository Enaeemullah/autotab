import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import { fetchProducts } from '../../api/services/inventory';
import { createSale } from '../../api/services/sales';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  updateQuantity,
  removeItem,
  resetCart,
  addPayment,
  clearPayments,
  setNotes
} from '../../store/slices/posSlice';

export function POSPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const cart = useAppSelector((state) => state.pos.cart);
  const payments = useAppSelector((state) => state.pos.payments);
  const notes = useAppSelector((state) => state.pos.notes);
  const { isOffline } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');

  const { data: products } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts({ search, limit: 20 }),
    keepPreviousData: true
  });

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      dispatch(resetCart());
      dispatch(clearPayments());
      dispatch(setNotes(''));
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = cart.reduce(
      (sum, item) => sum + (item.taxRate / 100) * item.price * item.quantity,
      0
    );
    const discount = cart.reduce(
      (sum, item) => sum + (item.discountRate / 100) * item.price * item.quantity,
      0
    );
    const grandTotal = subtotal + tax - discount;
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return { subtotal, tax, discount, grandTotal, paid, balance: grandTotal - paid };
  }, [cart, payments]);

  const handleAddProduct = (product: any) => {
    dispatch(
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.salePrice ?? product.sale_price ?? 0),
        quantity: 1,
        taxRate: Number(product.taxRate ?? product.tax_rate ?? 0),
        discountRate: 0
      })
    );
  };

  const handleCompleteSale = () => {
    if (!cart.length || !payments.length) {
      return;
    }
    mutation.mutate({
      notes,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discountRate: item.discountRate,
        taxRate: item.taxRate
      })),
      payments: payments.map((payment) => ({
        method: payment.method,
        amount: payment.amount,
        reference: payment.reference
      }))
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Products</h2>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or SKU"
            className="w-64 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products?.data?.map((product: any) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleAddProduct(product)}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-primary hover:bg-slate-950"
            >
              <p className="text-sm font-semibold text-slate-100">{product.name}</p>
              <p className="text-xs text-slate-400">{product.sku}</p>
              <p className="mt-2 text-lg font-semibold text-primary">
                ${Number(product.salePrice ?? product.sale_price ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">
                Stock: {Number(product.currentStock ?? product.current_stock ?? 0)}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Cart</h2>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {cart.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.sku}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(removeItem(item.id))}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Remove
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="text-xs text-slate-400">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    dispatch(
                      updateQuantity({
                        id: item.id,
                        quantity: Number(event.target.value)
                      })
                    )
                  }
                  className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Tax: {item.taxRate}%</span>
                <span>Discount: {item.discountRate}%</span>
              </div>
            </div>
          ))}
          {!cart.length && (
            <p className="text-sm text-slate-400">
              Add products to the cart by tapping on the product list.
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-200">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>${totals.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-primary">
            <span>Total</span>
            <span>${totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <textarea
            value={notes}
            onChange={(event) => dispatch(setNotes(event.target.value))}
            placeholder="Order notes"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="mt-3 space-y-2">
          {payments.map((payment, index) => (
            <div
              key={`${payment.method}-${index}`}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              <span>{payment.method.toUpperCase()}</span>
              <span>${payment.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            dispatch(
              addPayment({
                method: 'cash',
                amount: totals.grandTotal,
                reference: uuid().slice(0, 8)
              })
            )
          }
          className="mt-4 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-primary"
        >
          Add Cash Payment
        </button>
        <button
          type="button"
          onClick={handleCompleteSale}
          disabled={isOffline || !cart.length || totals.balance > 0 || mutation.isPending}
          className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isOffline ? 'Offline - will sync later' : mutation.isPending ? 'Processing…' : 'Complete Sale'}
        </button>
      </section>
    </div>
  );
}
