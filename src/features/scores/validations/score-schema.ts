import { z } from 'zod';
import { SCORE_LIMITS } from '@/lib/constants';

export const scoreEntrySchema = z.object({
  checkpointId: z.string().min(1),
  value: z
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(SCORE_LIMITS.MIN, 'Negative scores are not allowed')
    .max(SCORE_LIMITS.MAX, `Score cannot exceed ${SCORE_LIMITS.MAX}`),
});

export const saveScoresSchema = z.object({
  teamId: z.string().min(1),
  scores: z.array(scoreEntrySchema).min(1, 'At least one checkpoint score is required'),
});
