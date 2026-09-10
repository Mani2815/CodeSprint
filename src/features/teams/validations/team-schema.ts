import { z } from 'zod';

export const teamNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Team name is required')
    .max(80, 'Team name must be 80 characters or fewer'),
});

export type TeamNameInput = z.infer<typeof teamNameSchema>;
