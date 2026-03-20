import { useEffect, useRef, useState } from 'react';

import { chatApi } from '../api';
import type { Message, NormalizedApiError } from '../types';
import { isAbortError, normalizeUnknownApiError, OLDER_MESSAGES_PAGE_SIZE } from './shared';

type UseLoadOlderMessagesResult = {
  loadOlderMessages: (before: string) => Promise<Message[]>;
  loadingOlder: boolean;
  error: NormalizedApiError | null;
  clearError: () => void;
};

export const useLoadOlderMessages = (): UseLoadOlderMessagesResult => {
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadOlderMessages = async (before: string): Promise<Message[]> => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoadingOlder(true);
      setError(null);

      return await chatApi.getMessages(
        {
          before,
          limit: OLDER_MESSAGES_PAGE_SIZE,
        },
        abortController.signal,
      );
    } catch (caughtError) {
      if (isAbortError(caughtError)) {
        throw caughtError;
      }

      const normalizedError = normalizeUnknownApiError(caughtError);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }

      if (!abortController.signal.aborted) {
        setLoadingOlder(false);
      }
    }
  };

  return {
    loadOlderMessages,
    loadingOlder,
    error,
    clearError: () => {
      setError(null);
    },
  };
};
