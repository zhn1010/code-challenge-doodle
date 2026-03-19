import { useEffect, useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';

import { useCreateMessage, useMessages } from './hooks';
import { useLocalAuthor } from './identity';
import { mapMessageToChatMessageItem } from './mappers';
import type { Message } from './types';

type UseChatShellResult = {
  authorError: string | null;
  authorInputRef: RefObject<HTMLInputElement | null>;
  authorPromptVisible: boolean;
  authorValue: string;
  composerError: string | null;
  composerInputDisabled: boolean;
  composerInputRef: RefObject<HTMLInputElement | null>;
  composerPlaceholder: string;
  composerSubmitDisabled: boolean;
  composerSubmitLabel: string;
  composerValue: string;
  loadErrorMessage: string | null;
  loadingAnnouncement: string | null;
  loading: boolean;
  messageItems: ReturnType<typeof mapMessageToChatMessageItem>[];
  messageListRef: RefObject<HTMLDivElement | null>;
  sending: boolean;
  onAuthorChange: (value: string) => void;
  onAuthorSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onComposerChange: (value: string) => void;
  onComposerSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export const useChatShell = (): UseChatShellResult => {
  const { messages, loading, error } = useMessages();
  const {
    createMessage,
    sending,
    error: sendError,
    clearError: clearSendError,
  } = useCreateMessage();
  const { author, hasAuthor, saveAuthor } = useLocalAuthor();
  const authorInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const hasScrolledToLatestMessage = useRef(false);
  const previousMessageCount = useRef(0);
  const previousAuthorPromptVisible = useRef(!hasAuthor);
  const [authorDraft, setAuthorDraft] = useState(author);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const messageItems = visibleMessages.map((message) =>
    mapMessageToChatMessageItem(message, author),
  );
  const trimmedComposerValue = composerValue.trim();

  useEffect(() => {
    setVisibleMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (loading || error || messageItems.length === 0) {
      return;
    }

    const shouldScroll =
      !hasScrolledToLatestMessage.current || messageItems.length > previousMessageCount.current;

    if (shouldScroll && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }

    hasScrolledToLatestMessage.current = true;
    previousMessageCount.current = messageItems.length;
  }, [error, loading, messageItems.length]);

  useEffect(() => {
    if (!hasAuthor) {
      authorInputRef.current?.focus();
      previousAuthorPromptVisible.current = true;
      return;
    }

    // Hand focus back to the composer only when the author prompt has just been dismissed.
    if (previousAuthorPromptVisible.current) {
      composerInputRef.current?.focus();
    }

    previousAuthorPromptVisible.current = false;
  }, [hasAuthor]);

  const onAuthorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = saveAuthor(authorDraft);

    if (!result.ok) {
      setAuthorError(result.error);
      return;
    }

    setAuthorDraft(result.author);
    setAuthorError(null);
  };

  const onComposerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasAuthor || trimmedComposerValue.length === 0 || sending) {
      return;
    }

    try {
      const createdMessage = await createMessage({
        message: trimmedComposerValue,
        author,
      });

      setVisibleMessages((currentMessages) => [...currentMessages, createdMessage]);
      setComposerValue('');
      composerInputRef.current?.focus();
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
        return;
      }
    }
  };

  return {
    authorError,
    authorInputRef,
    authorPromptVisible: !hasAuthor,
    authorValue: authorDraft,
    composerError: sendError?.message ?? null,
    composerInputDisabled: !hasAuthor || sending,
    composerInputRef,
    composerPlaceholder: hasAuthor ? 'Message' : 'Choose your display name to join the chat',
    composerSubmitDisabled: !hasAuthor || loading || sending || trimmedComposerValue.length === 0,
    composerSubmitLabel: sending ? 'Sending...' : 'Send',
    composerValue,
    loadErrorMessage: error?.message ?? null,
    loadingAnnouncement: loading ? 'Loading messages.' : sending ? 'Sending message.' : null,
    loading,
    messageItems,
    messageListRef,
    sending,
    onAuthorChange: (value: string) => {
      setAuthorDraft(value);

      if (authorError) {
        setAuthorError(null);
      }
    },
    onAuthorSubmit,
    onComposerChange: (value: string) => {
      setComposerValue(value);

      if (sendError) {
        clearSendError();
      }
    },
    onComposerSubmit,
  };
};
