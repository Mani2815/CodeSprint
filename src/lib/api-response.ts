import { NextResponse } from 'next/server';
import { DuplicateTeamNameError, TeamNotFoundError } from '@/services/team-service';
import { InvalidScoreError } from '@/services/score-service';
import { EventNotFoundError, DuplicateEventSlugError } from '@/services/event-service';
import {
  CheckpointHasDataError,
  DuplicateCheckpointOrderError,
} from '@/services/checkpoint-service';
import { ProjectNotFoundError } from '@/services/project-service';
import {
  RegistrationNotFoundError,
  RegistrationStateError,
  RegistrationValidationError,
} from '@/services/registration-service';
import {
  DuplicateSubmissionError,
  TeamSubmissionAccessError,
  SubmissionEligibilityError,
  SubmissionWindowError,
} from '@/services/submission-service';
import { EvaluationScopeError } from '@/services/evaluation-service';
import {
  InvalidRepositoryUrlError,
  RepositoryUnavailableError,
} from '@/services/github-sync-service';

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Maps the typed errors thrown by the services layer to the right HTTP
 * status code, in one place, so every route handler's catch block is a
 * one-liner instead of re-implementing this switch.
 */
export function handleApiError(err: unknown) {
  if (err instanceof DuplicateTeamNameError) return apiError(409, err.message);
  if (err instanceof DuplicateEventSlugError) return apiError(409, err.message);
  if (err instanceof DuplicateCheckpointOrderError) return apiError(409, err.message);
  if (err instanceof CheckpointHasDataError) return apiError(409, err.message);
  if (err instanceof TeamNotFoundError) return apiError(404, err.message);
  if (err instanceof ProjectNotFoundError) return apiError(404, err.message);
  if (err instanceof RegistrationNotFoundError) return apiError(404, err.message);
  if (err instanceof RegistrationStateError) return apiError(409, err.message);
  if (err instanceof RegistrationValidationError) return apiError(400, err.message);
  if (err instanceof DuplicateSubmissionError) return apiError(409, err.message);
  if (err instanceof TeamSubmissionAccessError) return apiError(403, err.message);
  if (err instanceof SubmissionEligibilityError) return apiError(403, err.message);
  if (err instanceof SubmissionWindowError) return apiError(409, err.message);
  if (err instanceof EvaluationScopeError) return apiError(400, err.message);
  if (err instanceof InvalidRepositoryUrlError || err instanceof RepositoryUnavailableError)
    return apiError(400, err.message);
  if (err instanceof InvalidScoreError) return apiError(400, err.message);
  if (err instanceof EventNotFoundError) return apiError(404, err.message);

  return apiError(500, 'Something went wrong. Please try again.');
}
