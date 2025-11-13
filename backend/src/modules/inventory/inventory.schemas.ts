import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1),
  barcode: z.string().min(1).optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  costPrice: z.coerce.number().nonnegative(),
  salePrice: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0),
  reorderPoint: z.coerce.number().min(0).default(0),
  unit: z.string().default('unit'),
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  isBatchTracked: z.boolean().default(false),
  expiryTracking: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        sku: z.string().min(1),
        barcode: z.string().optional().nullable(),
        salePrice: z.coerce.number().nonnegative(),
        costPrice: z.coerce.number().nonnegative(),
        attributes: z.record(z.string(), z.string()).optional()
      })
    )
    .optional(),
  batches: z
    .array(
      z.object({
        batchCode: z.string().min(1),
        manufacturedAt: z.string().optional().nullable(),
        expiresAt: z.string().optional().nullable(),
        quantity: z.coerce.number().nonnegative()
      })
    )
    .optional()
});

export const updateProductSchema = productSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable()
});

export const supplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable()
});

export const stockLocationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
  branchId: z.string().uuid().optional().nullable()
});
