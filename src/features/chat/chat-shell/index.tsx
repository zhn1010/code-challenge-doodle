import { Composer } from '../../../components/composer';
import { MessageList } from '../../../components/message-list';
import { useMessages } from '../hooks';
import { mapMessageToChatMessageItem } from '../mappers';
import styles from './style.module.css';

export function ChatShell() {
  const { messages } = useMessages();
  const messageItems = messages.map((message) => mapMessageToChatMessageItem(message));

  return (
    <section className={styles.viewport} aria-label="Chat layout preview">
      <MessageList messages={messageItems} />
      <Composer disabled value="" />
    </section>
  );
}
