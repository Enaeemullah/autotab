import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  branchId: z.string().uuid().nullable().optional(),
  roleIds: z.array(z.string().uuid()).default([])
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(8).optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
