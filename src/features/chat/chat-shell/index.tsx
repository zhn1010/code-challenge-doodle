import { useEffect, useRef } from 'react';

import { ChatShellState } from '../../../components/chat-shell-state';
import { Composer } from '../../../components/composer';
import { MessageList } from '../../../components/message-list';
import { MessageListSkeleton } from '../../../components/message-list-skeleton';
import { useMessages } from '../hooks';
import { mapMessageToChatMessageItem } from '../mappers';
import styles from './style.module.css';

export function ChatShell() {
  const { messages, loading, error } = useMessages();
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToLatestMessage = useRef(false);
  const messageItems = messages.map((message) => mapMessageToChatMessageItem(message));

  useEffect(() => {
    if (loading || error || messageItems.length === 0 || hasScrolledToLatestMessage.current) {
      return;
    }

    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      hasScrolledToLatestMessage.current = true;
    }
  }, [error, loading, messageItems.length]);

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
      <Composer disabled value="" />
    </section>
  );
}
