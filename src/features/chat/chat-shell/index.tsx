import { ChatShellState } from '../../../components/chat-shell-state';
import { Composer } from '../../../components/composer';
import { MessageList } from '../../../components/message-list';
import { MessageListSkeleton } from '../../../components/message-list-skeleton';
import { useMessages } from '../hooks';
import { mapMessageToChatMessageItem } from '../mappers';
import styles from './style.module.css';

export function ChatShell() {
  const { messages, loading, error } = useMessages();
  const messageItems = messages.map((message) => mapMessageToChatMessageItem(message));
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

    return <MessageList messages={messageItems} />;
  })();

  return (
    <section className={styles.viewport} aria-label="Chat layout preview">
      {content}
      <Composer disabled value="" />
    </section>
  );
}
