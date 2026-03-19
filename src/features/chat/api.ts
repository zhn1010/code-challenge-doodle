import { appConfig } from '../../lib/config';

import type {
  ApiErrorMessage,
  ApiErrorResponse,
  ApiValidationIssue,
  CreateMessageInput,
  GetMessagesParams,
  Message,
  NormalizedApiError,
} from './types';

const { baseUrl, token, routePrefix, defaultMessagesLimit } = appConfig.chatApi;

const messagesUrl = `${baseUrl}${routePrefix}/messages`;

const defaultHeaders = {
  Authorization: `Bearer ${token}`,
} as const;

const isValidationIssue = (value: unknown): value is ApiValidationIssue => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'field' in value && 'message' in value;
};

const normalizeApiErrorMessage = (
  message: ApiErrorMessage | undefined,
): Pick<NormalizedApiError, 'message' | 'issues'> => {
  if (Array.isArray(message)) {
    const issues = message.filter(isValidationIssue);

    if (issues.length > 0) {
      return {
        message: issues.map((issue) => issue.message).join(', '),
        issues,
      };
    }
  }

  if (typeof message === 'string' && message.length > 0) {
    return {
      message,
      issues: [],
    };
  }

  return {
    message: 'Unexpected API error',
    issues: [],
  };
};

const normalizeApiError = async (response: Response): Promise<NormalizedApiError> => {
  let payload: ApiErrorResponse | undefined;

  try {
    payload = (await response.json()) as ApiErrorResponse;
  } catch {
    payload = undefined;
  }

  const normalizedMessage = normalizeApiErrorMessage(payload?.error?.message);

  return {
    statusCode: response.status,
    message: normalizedMessage.message,
    issues: normalizedMessage.issues,
    timestamp: payload?.error?.timestamp,
  };
};

const createQueryString = (params: GetMessagesParams): string => {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  if (params.after) {
    searchParams.set('after', params.after);
  }

  if (params.before) {
    searchParams.set('before', params.before);
  }

  const queryString = searchParams.toString();

  return queryString.length > 0 ? `?${queryString}` : '';
};

const request = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw await normalizeApiError(response);
  }

  return (await response.json()) as T;
};

export const chatApi = {
  getMessages(params: GetMessagesParams = {}): Promise<Message[]> {
    const queryString = createQueryString({
      limit: params.limit ?? defaultMessagesLimit,
      after: params.after,
      before: params.before,
    });

    return request<Message[]>(`${messagesUrl}${queryString}`);
  },

  createMessage(input: CreateMessageInput): Promise<Message> {
    return request<Message>(messagesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  },
};
