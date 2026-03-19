import { useEffect, useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';

import { useCreateMessage, useMessages } from './hooks';
import { useLocalAuthor } from './identity';
import { mapMessageToChatMessageItem } from './mappers';
import type { Message } from './types';

const USE_MOCK_MESSAGES = true;
const MOCK_AUTHOR = 'Peter';

const mockMessages: Message[] = [
  {
    _id: 'mock-1',
    author: 'NINJA',
    message: 'Great resource, thanks',
    createdAt: '2018-03-10T09:55:00.000Z',
  },
  {
    _id: 'mock-2',
    author: 'I am mister brilliant',
    message: 'THANKSSSS!!!!!',
    createdAt: '2018-03-10T10:10:00.000Z',
  },
  {
    _id: 'mock-3',
    author: 'martin57',
    message: 'Thanks Peter',
    createdAt: '2018-03-10T10:19:00.000Z',
  },
  {
    _id: 'mock-4',
    author: 'Patricia',
    message: 'Sounds good to me!',
    createdAt: '2018-03-10T10:22:00.000Z',
  },
  {
    _id: 'mock-5',
    author: MOCK_AUTHOR,
    message:
      'Hey folks! I wanted to get in touch with you regarding the project. Please, let me know how you plan to contribute.',
    createdAt: '2018-03-12T14:38:00.000Z',
  },
];

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
  const { messages, loading, error } = useMessages(undefined, { enabled: !USE_MOCK_MESSAGES });
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
  const effectiveAuthor = USE_MOCK_MESSAGES ? MOCK_AUTHOR : author;
  const [visibleMessages, setVisibleMessages] = useState<Message[]>(
    USE_MOCK_MESSAGES ? mockMessages : [],
  );
  const messageItems = visibleMessages.map((message) =>
    mapMessageToChatMessageItem(message, effectiveAuthor),
  );
  const trimmedComposerValue = composerValue.trim();

  useEffect(() => {
    if (USE_MOCK_MESSAGES) {
      return;
    }

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
    if (USE_MOCK_MESSAGES) {
      composerInputRef.current?.focus();
      return;
    }

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

    if ((!hasAuthor && !USE_MOCK_MESSAGES) || trimmedComposerValue.length === 0 || sending) {
      return;
    }

    if (USE_MOCK_MESSAGES) {
      setVisibleMessages((currentMessages) => [
        ...currentMessages,
        {
          _id: `mock-${currentMessages.length + 1}`,
          author: MOCK_AUTHOR,
          message: trimmedComposerValue,
          createdAt: new Date().toISOString(),
        },
      ]);
      setComposerValue('');
      composerInputRef.current?.focus();
      return;
    }

    try {
      const createdMessage = await createMessage({
        message: trimmedComposerValue,
        author: effectiveAuthor,
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
    authorPromptVisible: USE_MOCK_MESSAGES ? false : !hasAuthor,
    authorValue: USE_MOCK_MESSAGES ? MOCK_AUTHOR : authorDraft,
    composerError: USE_MOCK_MESSAGES ? null : (sendError?.message ?? null),
    composerInputDisabled: (!hasAuthor && !USE_MOCK_MESSAGES) || sending,
    composerInputRef,
    composerPlaceholder:
      USE_MOCK_MESSAGES || hasAuthor ? 'Message' : 'Choose your display name to join the chat',
    composerSubmitDisabled:
      (!hasAuthor && !USE_MOCK_MESSAGES) || loading || sending || trimmedComposerValue.length === 0,
    composerSubmitLabel: sending ? 'Sending...' : 'Send',
    composerValue,
    loadErrorMessage: USE_MOCK_MESSAGES ? null : (error?.message ?? null),
    loadingAnnouncement: USE_MOCK_MESSAGES
      ? null
      : loading
        ? 'Loading messages.'
        : sending
          ? 'Sending message.'
          : null,
    loading: USE_MOCK_MESSAGES ? false : loading,
    messageItems,
    messageListRef,
    sending: USE_MOCK_MESSAGES ? false : sending,
    onAuthorChange: (value: string) => {
      setAuthorDraft(value);

      if (authorError) {
        setAuthorError(null);
      }
    },
    onAuthorSubmit,
    onComposerChange: (value: string) => {
      setComposerValue(value);

      if (!USE_MOCK_MESSAGES && sendError) {
        clearSendError();
      }
    },
    onComposerSubmit,
  };
};
