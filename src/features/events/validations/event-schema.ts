import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required').max(100),
  slug: z
    .string()
    .trim()
    .min(1, 'Event slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export type EventInput = z.infer<typeof eventSchema>;

export const checkpointSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  label: z.string().trim().min(1, 'Label is required').max(50),
  order: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(1, 'Order must be positive')
  ),
  maxScore: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().min(1, 'Max score must be positive').nullable().optional()
  ),
});

export type CheckpointInput = z.infer<typeof checkpointSchema>;

export const updateCheckpointSchema = checkpointSchema.omit({ eventId: true });

export type UpdateCheckpointInput = z.infer<typeof updateCheckpointSchema>;
