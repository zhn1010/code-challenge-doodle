import type { NormalizedApiError } from '../types';

export const OLDER_MESSAGES_PAGE_SIZE = 20;
export const NEW_MESSAGES_POLL_INTERVAL_MS = 5_000;
export const INITIAL_MESSAGES_CURSOR = '9999-12-31T23:59:59.999Z';

export const isNormalizedApiError = (error: unknown): error is NormalizedApiError => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'statusCode' in error && 'message' in error && 'issues' in error;
};

export const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError';
};

export const normalizeUnknownApiError = (error: unknown): NormalizedApiError => {
  return isNormalizedApiError(error)
    ? error
    : {
        statusCode: 500,
        message: 'Unexpected API error',
        issues: [],
      };
};
