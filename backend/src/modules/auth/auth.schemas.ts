import { z } from 'zod';

const normalizeOptionalBranch = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6),
  branchId: z
    .preprocess(normalizeOptionalBranch, z.string().trim().uuid({ message: 'Branch ID must be a valid UUID' }))
    .optional(),
  tenantCode: z.string().trim().min(2).max(50).toLowerCase()
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
