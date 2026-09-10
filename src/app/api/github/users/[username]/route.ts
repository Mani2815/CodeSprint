import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/api-response';
import { GithubUserNotFoundError, verifyGithubUsername } from '@/services/github-sync-service';

const usernameSchema = z.string().trim().min(1).max(39);

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const parsed = usernameSchema.safeParse(params.username);
  if (!parsed.success) return apiError(400, 'Enter a valid GitHub username.');
  try {
    return apiSuccess(await verifyGithubUsername(parsed.data));
  } catch (error) {
    if (error instanceof GithubUserNotFoundError) return apiError(404, error.message);

    return apiError(502, 'GitHub verification is temporarily unavailable. Please try again.');
  }
}
