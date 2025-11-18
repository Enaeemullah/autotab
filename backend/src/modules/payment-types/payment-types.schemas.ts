import { z } from 'zod';

export const createPaymentTypeSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50).toLowerCase(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  requiresReference: z.boolean().default(false),
  markTransactionAsPaid: z.boolean().default(true),
  sortOrder: z.number().int().default(0)
});

export const updatePaymentTypeSchema = createPaymentTypeSchema.partial();

export type CreatePaymentTypeInput = z.infer<typeof createPaymentTypeSchema>;
export type UpdatePaymentTypeInput = z.infer<typeof updatePaymentTypeSchema>;

