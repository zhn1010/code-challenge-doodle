import { MessageItem } from '../message-item';
import type { ChatMessageItem } from '../../features/chat/types';
import styles from './style.module.css';

type MessageListProps = {
  messages: ChatMessageItem[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className={styles.messages}>
      <div className={styles.stack}>
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
