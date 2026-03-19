import type { Ref } from 'react';

import { MessageItem } from '../message-item';
import type { ChatMessageItem } from '../../features/chat/types';
import styles from './style.module.css';

type MessageListProps = {
  messages: ChatMessageItem[];
  containerRef?: Ref<HTMLDivElement>;
};

export function MessageList({ messages, containerRef }: MessageListProps) {
  return (
    <div ref={containerRef} className={styles.messages}>
      <div className={styles.stack}>
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
