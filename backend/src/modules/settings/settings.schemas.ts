import { z } from 'zod';

export const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export type UpdateSettingInput = z.infer<typeof updateSettingsSchema>;
