import { useEffect, useRef, useState } from 'react';

import { chatApi } from '../api';
import type { CreateMessageInput, Message, NormalizedApiError } from '../types';
import { isAbortError, normalizeUnknownApiError } from './shared';

type UseCreateMessageResult = {
  createMessage: (input: CreateMessageInput) => Promise<Message>;
  sending: boolean;
  error: NormalizedApiError | null;
  clearError: () => void;
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

      const normalizedError = normalizeUnknownApiError(caughtError);
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
