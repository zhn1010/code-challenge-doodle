import type { RefObject } from 'react';

import { ChatShellState } from '../../components/chat-shell-state';
import { MessageList } from '../../components/message-list';
import { MessageListSkeleton } from '../../components/message-list-skeleton';
import type { ChatMessageItem } from './types';

type ChatShellContentProps = {
  loadErrorMessage: string | null;
  loading: boolean;
  messageItems: ChatMessageItem[];
  messageListRef: RefObject<HTMLDivElement | null>;
};

export function ChatShellContent({
  loadErrorMessage,
  loading,
  messageItems,
  messageListRef,
}: ChatShellContentProps) {
  if (loading) {
    return <MessageListSkeleton />;
  }

  if (loadErrorMessage) {
    return <ChatShellState title="Could not load messages" body={loadErrorMessage} tone="error" />;
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
}
