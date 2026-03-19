import { useEffect, useState } from 'react';

import { chatApi } from './api';
import type { GetMessagesParams, Message, NormalizedApiError } from './types';

type UseMessagesResult = {
  messages: Message[];
  loading: boolean;
  error: NormalizedApiError | null;
};

const isNormalizedApiError = (error: unknown): error is NormalizedApiError => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'statusCode' in error && 'message' in error && 'issues' in error;
};

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError';
};

export const useMessages = (params?: GetMessagesParams): UseMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const limit = params?.limit;
  const after = params?.after;
  const before = params?.before;

  useEffect(() => {
    const abortController = new AbortController();

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const nextMessages = await chatApi.getMessages(
          { limit, after, before },
          abortController.signal,
        );

        setMessages(nextMessages);
      } catch (caughtError) {
        if (isAbortError(caughtError)) {
          return;
        }

        setError(
          isNormalizedApiError(caughtError)
            ? caughtError
            : {
                statusCode: 500,
                message: 'Unexpected API error',
                issues: [],
              },
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadMessages();

    return () => {
      abortController.abort();
    };
  }, [after, before, limit]);

  return {
    messages,
    loading,
    error,
  };
};
