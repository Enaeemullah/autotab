import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type ProductListResponse, type Product } from '../../api/services/inventory';
import { fetchActivePaymentTypes, type PaymentType } from '../../api/services/payment-types';
import { createSale } from '../../api/services/sales';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  updateQuantity,
  removeItem,
  resetCart,
  addPayment,
  clearPayments,
  removePayment,
  setNotes
} from '../../store/slices/posSlice';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export function POSPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const cart = useAppSelector((state) => state.pos.cart);
  const payments = useAppSelector((state) => state.pos.payments);
  const notes = useAppSelector((state) => state.pos.notes);
  const { isOffline } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const { data: productsResponse } = useQuery<ProductListResponse>({
    queryKey: ['products', search],
    queryFn: () => fetchProducts({ search, limit: 20 }),
    placeholderData: (previousData) => previousData
  });
  const products = productsResponse?.data ?? [];

  const { data: paymentTypes = [] } = useQuery<PaymentType[]>({
    queryKey: ['paymentTypes', 'active'],
    queryFn: fetchActivePaymentTypes
  });

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      dispatch(resetCart());
      dispatch(clearPayments());
      dispatch(setNotes(''));
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setPaymentModalOpen(false);
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

  const handleAddProduct = (product: Product) => {
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

  const handleOpenPaymentModal = (paymentType?: PaymentType) => {
    if (paymentType) {
      setSelectedPaymentType(paymentType);
      // If markTransactionAsPaid is true, set to balance or grand total
      // If false, start with empty or remaining balance
      if (paymentType.markTransactionAsPaid) {
        setPaymentAmount(totals.balance > 0 ? totals.balance.toFixed(2) : totals.grandTotal.toFixed(2));
      } else {
        // For partial payments, start with remaining balance or empty
        setPaymentAmount(totals.balance > 0 ? totals.balance.toFixed(2) : '');
      }
    } else {
      setSelectedPaymentType(null);
      setPaymentAmount('');
    }
    setPaymentReference('');
    setPaymentModalOpen(true);
  };

  const handleAddPayment = () => {
    if (!selectedPaymentType || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    dispatch(
      addPayment({
        paymentTypeId: selectedPaymentType.id,
        amount,
        reference: selectedPaymentType.requiresReference ? paymentReference : undefined
      })
    );

    setPaymentModalOpen(false);
    setSelectedPaymentType(null);
    setPaymentAmount('');
    setPaymentReference('');
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
        paymentTypeId: payment.paymentTypeId,
        amount: payment.amount,
        reference: payment.reference
      }))
    });
  };

  const getPaymentTypeName = (paymentTypeId: string) => {
    const type = paymentTypes.find((pt) => pt.id === paymentTypeId);
    return type?.name || 'Unknown';
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
          {products.map((product) => (
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
          {payments.length > 0 && (
            <>
              <div className="flex justify-between text-slate-300">
                <span>Paid</span>
                <span>${totals.paid.toFixed(2)}</span>
              </div>
              <div
                className={`flex justify-between text-lg font-semibold ${
                  totals.balance > 0 ? 'text-amber-400' : 'text-green-400'
                }`}
              >
                <span>Balance</span>
                <span>${Math.abs(totals.balance).toFixed(2)}</span>
              </div>
            </>
          )}
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Payments</h3>
            <button
              type="button"
              onClick={() => handleOpenPaymentModal()}
              className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 hover:border-primary hover:text-primary"
            >
              <PlusIcon className="h-4 w-4" />
              Add Payment
            </button>
          </div>
          {payments.map((payment, index) => (
            <div
              key={`${payment.paymentTypeId}-${index}`}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              <div className="flex-1">
                <p className="font-medium">{getPaymentTypeName(payment.paymentTypeId)}</p>
                {payment.reference && (
                  <p className="text-xs text-slate-400">Ref: {payment.reference}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => dispatch(removePayment(index))}
                  className="text-rose-400 hover:text-rose-300"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <p className="text-xs text-slate-500">No payments added yet</p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {paymentTypes.map((paymentType) => (
            <button
              key={paymentType.id}
              type="button"
              onClick={() => handleOpenPaymentModal(paymentType)}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 transition hover:border-primary hover:bg-slate-900 hover:text-primary"
            >
              {paymentType.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCompleteSale}
          disabled={isOffline || !cart.length || !payments.length || mutation.isPending}
          className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isOffline
            ? 'Offline - will sync later'
            : mutation.isPending
              ? 'Processing…'
              : totals.balance > 0
                ? `Complete Sale (Balance: $${totals.balance.toFixed(2)})`
                : 'Complete Sale'}
        </button>
      </section>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <h3 className="text-lg font-semibold text-slate-100">
                {selectedPaymentType ? `Add ${selectedPaymentType.name} Payment` : 'Select Payment Type'}
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {!selectedPaymentType ? (
                <div className="space-y-2">
                  {paymentTypes.map((paymentType) => (
                    <button
                      key={paymentType.id}
                      type="button"
                      onClick={() => {
                        setSelectedPaymentType(paymentType);
                        setPaymentAmount(totals.balance > 0 ? totals.balance.toFixed(2) : totals.grandTotal.toFixed(2));
                      }}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-left text-slate-200 transition hover:border-primary hover:bg-slate-900"
                    >
                      <p className="font-medium">{paymentType.name}</p>
                      {paymentType.description && (
                        <p className="text-xs text-slate-400">{paymentType.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={totals.grandTotal}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={selectedPaymentType?.markTransactionAsPaid ? totals.grandTotal.toFixed(2) : "0.00"}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none"
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-400">
                        Total: ${totals.grandTotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Already Paid: ${totals.paid.toFixed(2)}
                      </p>
                      <p className={`text-xs font-medium ${
                        totals.balance > 0 ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        Remaining Balance: ${totals.balance.toFixed(2)}
                      </p>
                      {!selectedPaymentType?.markTransactionAsPaid && (
                        <p className="text-xs text-amber-300 mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                          ⚠️ This payment type allows partial payment. Enter the amount you're receiving now.
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedPaymentType.requiresReference && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">
                        Reference *
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Transaction reference"
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentType(null);
                        setPaymentAmount('');
                        setPaymentReference('');
                      }}
                      className="flex-1 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPayment}
                      disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || (selectedPaymentType.requiresReference && !paymentReference)}
                      className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-slate-700"
                    >
                      Add Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
