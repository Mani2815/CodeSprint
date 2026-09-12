import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import {
  createRegistration,
  listRegistrations,
  validateRegistrationInput,
} from '@/services/registration-service';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
const member = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  className: z.string().trim().min(1, 'Class name is required'),
  regNo: z.string().trim().min(1, 'Registration number is required').max(50),
  githubUsername: z.string().trim().min(1).max(39),
  isLeader: z.boolean(),
});
const schema = z.object({
  teamName: z.string().trim().min(2).max(100),
  projectName: z.string().trim().min(2).max(100),
  projectDescription: z.string().trim().min(10).max(3000),
  college: z.string().trim().min(2).max(200),
  repositoryUrl: z.string().url().optional().or(z.literal('')).nullable(),
  members: z
    .array(member)
    .length(2)
    .refine(
      (members) => members.filter((m) => m.isLeader).length === 1,
      'Choose exactly one team leader.'
    ),
});
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return apiError(400, parsed.error.issues[0]?.message ?? 'Invalid registration.');
  try {
    const validated = validateRegistrationInput(parsed.data);
    return apiSuccess(
      await createRegistration(await getActiveEventId(ACTIVE_EVENT_SLUG), validated),
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
export async function GET() {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  try {
    return apiSuccess(await listRegistrations(await getActiveEventId(ACTIVE_EVENT_SLUG)));
  } catch (err) {
    return handleApiError(err);
  }
}
