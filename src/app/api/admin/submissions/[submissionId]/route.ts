import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { getSubmissionDetail } from '@/services/submission-service';
import { syncGithubActivity } from '@/services/github-sync-service';
export async function GET(_req: Request, { params }: { params: { submissionId: string } }) {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  try {
    const submission = await getSubmissionDetail(params.submissionId);
    return submission ? apiSuccess(submission) : apiError(404, 'Submission not found.');
  } catch (err) {
    return handleApiError(err);
  }
}
export async function POST(_req: Request, { params }: { params: { submissionId: string } }) {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  try {
    return apiSuccess(await syncGithubActivity(params.submissionId));
  } catch (err) {
    return handleApiError(err);
  }
}
