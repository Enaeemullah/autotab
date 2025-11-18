import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(50).toLowerCase(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  features: z.array(z.string()).default([]), // Feature allocation
  adminUser: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional().nullable()
  })
});

export const updateTenantSchema = createTenantSchema.omit({ adminUser: true }).partial();

export const createTenantAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable()
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateTenantAdminInput = z.infer<typeof createTenantAdminSchema>;

