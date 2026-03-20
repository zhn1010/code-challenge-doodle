import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';

import { appConfig } from '../../lib/config';
import {
  OLDER_MESSAGES_PAGE_SIZE,
  useCreateMessage,
  useLoadOlderMessages,
  useMessages,
  usePollNewMessages,
} from './hooks';
import { useLocalAuthor } from './identity';
import { mapMessageToChatMessageItem } from './mappers';
import type { Message } from './types';

const INITIAL_MESSAGES_PAGE_SIZE = appConfig.chatApi.defaultMessagesLimit;
const SCROLL_TO_LATEST_THRESHOLD = 24;

const mergeMessages = (...messageGroups: Message[][]): Message[] => {
  const uniqueMessages = new Map<string, Message>();

  messageGroups.flat().forEach((message) => {
    uniqueMessages.set(message._id, message);
  });

  return Array.from(uniqueMessages.values()).sort(
    (firstMessage, secondMessage) =>
      new Date(firstMessage.createdAt).getTime() - new Date(secondMessage.createdAt).getTime(),
  );
};

const isNearBottom = (container: HTMLDivElement | null): boolean => {
  if (!container) {
    return false;
  }

  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    SCROLL_TO_LATEST_THRESHOLD
  );
};

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
  loadOlderErrorMessage: string | null;
  loadingOlder: boolean;
  canLoadOlder: boolean;
  loadingAnnouncement: string | null;
  loading: boolean;
  messageItems: ReturnType<typeof mapMessageToChatMessageItem>[];
  messageListRef: RefObject<HTMLDivElement | null>;
  sending: boolean;
  onAuthorChange: (value: string) => void;
  onAuthorSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onComposerChange: (value: string) => void;
  onComposerSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onLoadOlderMessages: () => Promise<void>;
};

export const useChatShell = (): UseChatShellResult => {
  const { messages, loading, error } = useMessages();
  const {
    createMessage,
    sending,
    error: sendError,
    clearError: clearSendError,
  } = useCreateMessage();
  const {
    loadOlderMessages,
    loadingOlder,
    error: loadOlderError,
    clearError: clearLoadOlderError,
  } = useLoadOlderMessages();
  const { author, hasAuthor, saveAuthor } = useLocalAuthor();
  const authorInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const pendingScrollToLatest = useRef(false);
  const pendingScrollRestore = useRef<{
    previousScrollHeight: number;
    previousScrollTop: number;
  } | null>(null);
  const previousAuthorPromptVisible = useRef(!hasAuthor);
  const [authorDraft, setAuthorDraft] = useState(author);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [olderMessages, setOlderMessages] = useState<Message[]>([]);
  const [polledMessages, setPolledMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState<boolean | null>(null);
  const visibleMessages = mergeMessages(olderMessages, messages, polledMessages, sentMessages);
  const messageItems = visibleMessages.map((message) =>
    mapMessageToChatMessageItem(message, author),
  );
  const latestMessageCreatedAt = visibleMessages[visibleMessages.length - 1]?.createdAt;
  const trimmedComposerValue = composerValue.trim();
  const canLoadOlder =
    (hasMoreOlderMessages ?? messages.length >= INITIAL_MESSAGES_PAGE_SIZE) &&
    !loading &&
    !loadingOlder &&
    visibleMessages.length > 0;

  usePollNewMessages({
    after: latestMessageCreatedAt,
    enabled: !loading && !error && visibleMessages.length > 0,
    onMessages: (nextMessages) => {
      const shouldStickToLatest =
        trimmedComposerValue.length === 0 && isNearBottom(messageListRef.current);

      if (shouldStickToLatest) {
        pendingScrollToLatest.current = true;
      }

      setPolledMessages((currentMessages) => mergeMessages(currentMessages, nextMessages));
    },
  });

  useLayoutEffect(() => {
    if (!messageListRef.current || messageItems.length === 0) {
      return;
    }

    if (pendingScrollRestore.current) {
      const { previousScrollHeight, previousScrollTop } = pendingScrollRestore.current;
      const nextScrollHeight = messageListRef.current.scrollHeight;

      messageListRef.current.scrollTop =
        previousScrollTop + (nextScrollHeight - previousScrollHeight);
      pendingScrollRestore.current = null;
      return;
    }

    if (pendingScrollToLatest.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      pendingScrollToLatest.current = false;
    }
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

      pendingScrollToLatest.current = true;
      setSentMessages((currentMessages) => [...currentMessages, createdMessage]);
      setComposerValue('');
      composerInputRef.current?.focus();
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
        return;
      }
    }
  };

  const onLoadOlderMessages = async () => {
    if (loading || loadingOlder || error || visibleMessages.length === 0 || !canLoadOlder) {
      return;
    }

    const scrollContainer = messageListRef.current;
    const oldestMessage = visibleMessages[0];

    if (!scrollContainer || !oldestMessage) {
      return;
    }

    clearLoadOlderError();

    try {
      const nextOlderMessages = await loadOlderMessages(oldestMessage.createdAt);

      if (nextOlderMessages.length === 0) {
        setHasMoreOlderMessages(false);
        return;
      }

      pendingScrollRestore.current = {
        previousScrollHeight: scrollContainer.scrollHeight,
        previousScrollTop: scrollContainer.scrollTop,
      };

      setOlderMessages((currentMessages) => mergeMessages(nextOlderMessages, currentMessages));
      setHasMoreOlderMessages(nextOlderMessages.length >= OLDER_MESSAGES_PAGE_SIZE);
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
    loadOlderErrorMessage: loadOlderError?.message ?? null,
    loadingOlder,
    canLoadOlder,
    loadingAnnouncement: loading
      ? 'Loading messages.'
      : loadingOlder
        ? 'Loading older messages.'
        : sending
          ? 'Sending message.'
          : null,
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
    onLoadOlderMessages,
  };
};
