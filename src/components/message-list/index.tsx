import type { Ref } from 'react';

import { SkeletonLine } from '../skeleton-line';
import { MessageItem } from '../message-item';
import type { ChatMessageItem } from '../../features/chat/types';
import styles from './style.module.css';

type MessageListProps = {
  canLoadOlder?: boolean;
  loadOlderErrorMessage?: string | null;
  loadingOlder?: boolean;
  messages: ChatMessageItem[];
  containerRef?: Ref<HTMLDivElement>;
  onLoadOlderMessages?: () => Promise<void>;
};

export function MessageList({
  canLoadOlder = false,
  loadOlderErrorMessage,
  loadingOlder = false,
  messages,
  containerRef,
  onLoadOlderMessages,
}: MessageListProps) {
  return (
    <div ref={containerRef} className={styles.messages}>
      <div className={styles.content}>
        {canLoadOlder ? (
          <button
            className={styles.loadOlderButton}
            type="button"
            onClick={() => void onLoadOlderMessages?.()}
          >
            Load older messages
          </button>
        ) : null}
        {loadingOlder ? (
          <div className={styles.olderSkeleton} aria-hidden="true">
            <SkeletonLine className={styles.olderSkeletonLine} />
            <SkeletonLine
              className={`${styles.olderSkeletonLine} ${styles.olderSkeletonLineShort}`}
            />
          </div>
        ) : null}
        {loadOlderErrorMessage ? (
          <p className={styles.olderError} role="alert">
            {loadOlderErrorMessage}
          </p>
        ) : null}
        <div className={styles.stack}>
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </div>
    </div>
  );
}
