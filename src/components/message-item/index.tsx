import type { ChatMessageItem } from '../../features/chat/types';

import styles from './style.module.css';

type MessageItemProps = {
  message: ChatMessageItem;
};

export function MessageItem({ message }: MessageItemProps) {
  const className = `${styles.message} ${
    message.variant === 'outgoing' ? styles.outgoing : styles.incoming
  }`;

  return (
    <article className={className}>
      {message.author ? <p className={styles.author}>{message.author}</p> : null}
      <p className={styles.body}>{message.body}</p>
      <p className={styles.meta}>{message.timestamp}</p>
    </article>
  );
}
