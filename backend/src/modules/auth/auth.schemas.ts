import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  branchId: z.string().uuid().optional(),
  tenantCode: z.string().min(2).max(50)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
