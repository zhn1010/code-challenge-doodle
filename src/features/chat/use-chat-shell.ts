import { useEffect, useRef, useState } from 'react';
import type { RefObject, SyntheticEvent } from 'react';

import { useLocalAuthor } from './identity';
import { mapMessageToChatMessageItem } from './mappers';
import { useChatConversation } from './use-chat-conversation';
import { useChatScrollEffect, useChatScrollState } from './use-chat-scroll';

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
  onAuthorSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
  onComposerChange: (value: string) => void;
  onComposerSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => Promise<void>;
  onLoadOlderMessages: () => Promise<void>;
  onMessageListScroll: () => void;
};

export const useChatShell = (): UseChatShellResult => {
  const { author, hasAuthor, saveAuthor } = useLocalAuthor();
  const authorInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);
  const previousAuthorPromptVisible = useRef(!hasAuthor);
  const [authorDraft, setAuthorDraft] = useState(author);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const trimmedComposerValue = composerValue.trim();
  const scroll = useChatScrollState();
  const {
    canLoadOlder,
    clearSendError,
    loadErrorMessage,
    loadOlderErrorMessage,
    loading,
    loadingOlder,
    messages,
    sending,
    sendErrorMessage,
    loadOlderMessages,
    sendMessage,
  } = useChatConversation({
    author,
    isAtLatest: scroll.isAtLatest,
    isComposerIdle: trimmedComposerValue.length === 0,
    prepareScrollRestore: scroll.prepareScrollRestore,
    requestScrollToLatest: scroll.requestScrollToLatest,
  });
  const messageItems = messages.map((message) => mapMessageToChatMessageItem(message, author));
  useChatScrollEffect({
    hasError: Boolean(loadErrorMessage),
    loading,
    messageCount: messageItems.length,
    hasAppliedInitialScrollRef: scroll.hasAppliedInitialScrollRef,
    messageListRef: scroll.messageListRef,
    pendingScrollRestoreRef: scroll.pendingScrollRestoreRef,
    pendingScrollToLatestRef: scroll.pendingScrollToLatestRef,
    setIsAtLatest: scroll.setIsAtLatest,
  });

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

  const onAuthorSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();

    const result = saveAuthor(authorDraft);

    if (!result.ok) {
      setAuthorError(result.error);
      return;
    }

    setAuthorDraft(result.author);
    setAuthorError(null);
  };

  const onComposerSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();

    if (!hasAuthor || trimmedComposerValue.length === 0 || sending) {
      return;
    }

    try {
      await sendMessage(trimmedComposerValue);
      setComposerValue('');
      composerInputRef.current?.focus();
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
        return;
      }
    }
  };

  const onLoadOlderMessages = async () => {
    try {
      await loadOlderMessages();
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
    composerError: sendErrorMessage,
    composerInputDisabled: !hasAuthor || sending,
    composerInputRef,
    composerPlaceholder: hasAuthor ? 'Message' : 'Choose your display name to join the chat',
    composerSubmitDisabled: !hasAuthor || loading || sending || trimmedComposerValue.length === 0,
    composerSubmitLabel: sending ? 'Sending...' : 'Send',
    composerValue,
    loadErrorMessage,
    loadOlderErrorMessage,
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
    messageListRef: scroll.messageListRef,
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

      if (sendErrorMessage) {
        clearSendError();
      }
    },
    onComposerSubmit,
    onLoadOlderMessages,
    onMessageListScroll: scroll.onMessageListScroll,
  };
};
