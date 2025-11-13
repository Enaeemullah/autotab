import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  discountRate: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).default(0)
});

export const paymentSchema = z.object({
  method: z.enum(['cash', 'card', 'wallet', 'bank_transfer', 'split']),
  amount: z.coerce.number().nonnegative(),
  reference: z.string().optional().nullable(),
  meta: z.record(z.any()).optional()
});

export const saleSchema = z.object({
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1),
  payments: z.array(paymentSchema).min(1),
  discountTotal: z.coerce.number().min(0).default(0),
  taxTotal: z.coerce.number().min(0).default(0)
});

export type SaleInput = z.infer<typeof saleSchema>;
