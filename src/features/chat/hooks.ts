import { useEffect, useRef, useState } from 'react';

import { chatApi } from './api';
import type { CreateMessageInput, GetMessagesParams, Message, NormalizedApiError } from './types';

type UseMessagesResult = {
  messages: Message[];
  loading: boolean;
  error: NormalizedApiError | null;
};

type UseMessagesOptions = {
  enabled?: boolean;
};

type UseCreateMessageResult = {
  createMessage: (input: CreateMessageInput) => Promise<Message>;
  sending: boolean;
  error: NormalizedApiError | null;
  clearError: () => void;
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

export const useMessages = (
  params?: GetMessagesParams,
  options: UseMessagesOptions = {},
): UseMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(options.enabled ?? true);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const enabled = options.enabled ?? true;
  const limit = params?.limit;
  const after = params?.after;
  const before = params?.before;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setMessages([]);
      return;
    }

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
  }, [after, before, enabled, limit]);

  return {
    messages,
    loading,
    error,
  };
};

export const useCreateMessage = (): UseCreateMessageResult => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const createMessage = async (input: CreateMessageInput): Promise<Message> => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setSending(true);
      setError(null);

      return await chatApi.createMessage(input, abortController.signal);
    } catch (caughtError) {
      if (isAbortError(caughtError)) {
        throw caughtError;
      }

      const normalizedError = isNormalizedApiError(caughtError)
        ? caughtError
        : {
            statusCode: 500,
            message: 'Unexpected API error',
            issues: [],
          };

      setError(normalizedError);
      throw normalizedError;
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }

      if (!abortController.signal.aborted) {
        setSending(false);
      }
    }
  };

  return {
    createMessage,
    sending,
    error,
    clearError: () => {
      setError(null);
    },
  };
};
