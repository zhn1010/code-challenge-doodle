import { useState } from 'react';

import { appConfig } from '../../lib/config';
import {
  OLDER_MESSAGES_PAGE_SIZE,
  useCreateMessage,
  useLoadOlderMessages,
  useMessages,
  usePollNewMessages,
} from './hooks';
import type { Message } from './types';

const INITIAL_MESSAGES_PAGE_SIZE = appConfig.chatApi.defaultMessagesLimit;

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

type UseChatConversationParams = {
  author: string;
  isAtLatest: boolean;
  isComposerIdle: boolean;
  prepareScrollRestore: () => boolean;
  requestScrollToLatest: () => void;
};

type UseChatConversationResult = {
  canLoadOlder: boolean;
  loadErrorMessage: string | null;
  loadOlderErrorMessage: string | null;
  loading: boolean;
  loadingOlder: boolean;
  messages: Message[];
  sending: boolean;
  sendErrorMessage: string | null;
  clearSendError: () => void;
  loadOlderMessages: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
};

export const useChatConversation = ({
  author,
  isAtLatest,
  isComposerIdle,
  prepareScrollRestore,
  requestScrollToLatest,
}: UseChatConversationParams): UseChatConversationResult => {
  const { messages, loading, error } = useMessages();
  const {
    createMessage,
    sending,
    error: sendError,
    clearError: clearSendError,
  } = useCreateMessage();
  const {
    loadOlderMessages: requestOlderMessages,
    loadingOlder,
    error: loadOlderError,
    clearError: clearLoadOlderError,
  } = useLoadOlderMessages();
  const [olderMessages, setOlderMessages] = useState<Message[]>([]);
  const [polledMessages, setPolledMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState<boolean | null>(null);
  const visibleMessages = mergeMessages(olderMessages, messages, polledMessages, sentMessages);
  const latestMessageCreatedAt = visibleMessages[visibleMessages.length - 1]?.createdAt;
  const canLoadOlder =
    (hasMoreOlderMessages ?? messages.length >= INITIAL_MESSAGES_PAGE_SIZE) &&
    !loading &&
    !loadingOlder &&
    visibleMessages.length > 0;

  usePollNewMessages({
    after: latestMessageCreatedAt,
    enabled: !loading && !error && visibleMessages.length > 0 && isAtLatest && isComposerIdle,
    onMessages: (nextMessages) => {
      requestScrollToLatest();
      setPolledMessages((currentMessages) => mergeMessages(currentMessages, nextMessages));
    },
  });

  const sendMessage = async (message: string) => {
    const createdMessage = await createMessage({
      message,
      author,
    });

    requestScrollToLatest();
    setSentMessages((currentMessages) => [...currentMessages, createdMessage]);
  };

  const loadOlderMessages = async () => {
    if (loading || loadingOlder || error || visibleMessages.length === 0 || !canLoadOlder) {
      return;
    }

    const oldestMessage = visibleMessages[0];

    if (!oldestMessage) {
      return;
    }

    clearLoadOlderError();

    const nextOlderMessages = await requestOlderMessages(oldestMessage.createdAt);

    if (nextOlderMessages.length === 0) {
      setHasMoreOlderMessages(false);
      return;
    }

    if (!prepareScrollRestore()) {
      return;
    }

    setOlderMessages((currentMessages) => mergeMessages(nextOlderMessages, currentMessages));
    setHasMoreOlderMessages(nextOlderMessages.length >= OLDER_MESSAGES_PAGE_SIZE);
  };

  return {
    canLoadOlder,
    loadErrorMessage: error?.message ?? null,
    loadOlderErrorMessage: loadOlderError?.message ?? null,
    loading,
    loadingOlder,
    messages: visibleMessages,
    sending,
    sendErrorMessage: sendError?.message ?? null,
    clearSendError,
    loadOlderMessages,
    sendMessage,
  };
};
