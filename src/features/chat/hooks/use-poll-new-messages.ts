import { useEffect, useRef, useState } from 'react';

import { chatApi } from '../api';
import type { Message, NormalizedApiError } from '../types';
import { isAbortError, NEW_MESSAGES_POLL_INTERVAL_MS, normalizeUnknownApiError } from './shared';

type UsePollNewMessagesOptions = {
  after?: string;
  enabled?: boolean;
  intervalMs?: number;
  onMessages: (messages: Message[]) => void;
};

type UsePollNewMessagesResult = {
  error: NormalizedApiError | null;
  clearError: () => void;
};

export const usePollNewMessages = ({
  after,
  enabled = true,
  intervalMs = NEW_MESSAGES_POLL_INTERVAL_MS,
  onMessages,
}: UsePollNewMessagesOptions): UsePollNewMessagesResult => {
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const onMessagesRef = useRef(onMessages);
  const pollingRef = useRef(false);

  useEffect(() => {
    onMessagesRef.current = onMessages;
  }, [onMessages]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !after) {
      abortControllerRef.current?.abort();
      pollingRef.current = false;
      setError(null);
      return;
    }

    const pollMessages = async () => {
      if (pollingRef.current) {
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      pollingRef.current = true;

      try {
        const nextMessages = await chatApi.getMessages({ after }, abortController.signal);

        setError(null);

        if (nextMessages.length > 0) {
          onMessagesRef.current(nextMessages);
        }
      } catch (caughtError) {
        if (isAbortError(caughtError)) {
          return;
        }

        setError(normalizeUnknownApiError(caughtError));
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }

        pollingRef.current = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void pollMessages();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
      abortControllerRef.current?.abort();
      pollingRef.current = false;
    };
  }, [after, enabled, intervalMs]);

  return {
    error,
    clearError: () => {
      setError(null);
    },
  };
};
