import { z } from 'zod';

export const registerTenantSchema = z.object({
  tenant: z.object({
    name: z.string().min(1),
    code: z.string().min(2),
    contactEmail: z.string().email().optional().nullable(),
    contactPhone: z.string().optional().nullable()
  }),
  branch: z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    address: z.string().optional().nullable(),
    timezone: z.string().default('UTC')
  }),
  adminUser: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional().nullable()
  })
});

export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;
