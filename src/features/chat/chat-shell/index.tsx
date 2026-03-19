import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { ChatIdentityPrompt } from '../../../components/chat-identity-prompt';
import { ChatShellState } from '../../../components/chat-shell-state';
import { Composer } from '../../../components/composer';
import { MessageList } from '../../../components/message-list';
import { MessageListSkeleton } from '../../../components/message-list-skeleton';
import { useMessages } from '../hooks';
import { useLocalAuthor } from '../identity';
import { mapMessageToChatMessageItem } from '../mappers';
import styles from './style.module.css';

export function ChatShell() {
  const { messages, loading, error } = useMessages();
  const { author, hasAuthor, saveAuthor } = useLocalAuthor();
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToLatestMessage = useRef(false);
  const [authorDraft, setAuthorDraft] = useState(author);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const messageItems = messages.map((message) => mapMessageToChatMessageItem(message, author));

  useEffect(() => {
    if (loading || error || messageItems.length === 0 || hasScrolledToLatestMessage.current) {
      return;
    }

    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      hasScrolledToLatestMessage.current = true;
    }
  }, [error, loading, messageItems.length]);

  const handleAuthorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = saveAuthor(authorDraft);

    if (!result.ok) {
      setAuthorError(result.error);
      return;
    }

    setAuthorDraft(result.author);
    setAuthorError(null);
  };

  const content = (() => {
    if (loading) {
      return <MessageListSkeleton />;
    }

    if (error) {
      return <ChatShellState title="Could not load messages" body={error.message} tone="error" />;
    }

    if (messageItems.length === 0) {
      return (
        <ChatShellState
          title="No messages yet"
          body="Once the conversation starts, messages will appear here."
        />
      );
    }

    return <MessageList messages={messageItems} containerRef={messageListRef} />;
  })();

  return (
    <section className={styles.viewport} aria-label="Chat layout preview">
      {content}
      {!hasAuthor ? (
        <ChatIdentityPrompt
          error={authorError}
          value={authorDraft}
          onChange={(value) => {
            setAuthorDraft(value);

            if (authorError) {
              setAuthorError(null);
            }
          }}
          onSubmit={handleAuthorSubmit}
        />
      ) : null}
      <Composer
        disabled
        placeholder={hasAuthor ? 'Message' : 'Choose your display name to join the chat'}
        value=""
      />
    </section>
  );
}
