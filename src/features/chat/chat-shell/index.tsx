import { Composer } from '../../../components/composer';
import { MessageList } from '../../../components/message-list';
import { useMessages } from '../hooks';
import { mapMessageToChatMessageItem } from '../mappers';
import styles from './style.module.css';

type ChatShellStateProps = {
  title: string;
  body: string;
  tone?: 'neutral' | 'error';
};

function ChatShellState({ title, body, tone = 'neutral' }: ChatShellStateProps) {
  const cardClassName =
    tone === 'error' ? `${styles.stateCard} ${styles.stateCardError}` : styles.stateCard;

  return (
    <div
      className={styles.state}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <div className={cardClassName}>
        <p className={styles.stateTitle}>{title}</p>
        <p className={styles.stateBody}>{body}</p>
      </div>
    </div>
  );
}

export function ChatShell() {
  const { messages, loading, error } = useMessages();
  const messageItems = messages.map((message) => mapMessageToChatMessageItem(message));
  const content = (() => {
    if (loading) {
      return (
        <ChatShellState
          title="Loading messages"
          body="Connecting to the chat API and fetching the latest conversation."
        />
      );
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
