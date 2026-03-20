import { useEffect, useState } from 'react';

import { chatApi } from '../api';
import type { GetMessagesParams, Message, NormalizedApiError } from '../types';
import { INITIAL_MESSAGES_CURSOR, isAbortError, normalizeUnknownApiError } from './shared';

type UseMessagesResult = {
  messages: Message[];
  loading: boolean;
  error: NormalizedApiError | null;
};

type UseMessagesOptions = {
  enabled?: boolean;
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
  // The API returns the oldest page by default, so the initial load needs a future `before`
  // cursor to request the latest page while keeping the response ordered chronologically.
  const effectiveBefore = after ? undefined : (before ?? INITIAL_MESSAGES_CURSOR);

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
          { limit, after, before: effectiveBefore },
          abortController.signal,
        );

        setMessages(nextMessages);
      } catch (caughtError) {
        if (isAbortError(caughtError)) {
          return;
        }

        setError(normalizeUnknownApiError(caughtError));
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
  }, [after, effectiveBefore, enabled, limit]);

  return {
    messages,
    loading,
    error,
  };
};
