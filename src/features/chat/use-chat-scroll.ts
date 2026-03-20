import { useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const SCROLL_TO_LATEST_THRESHOLD = 24;

const isNearBottom = (container: HTMLDivElement | null): boolean => {
  if (!container) {
    return false;
  }

  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    SCROLL_TO_LATEST_THRESHOLD
  );
};

type UseChatScrollParams = {
  hasError: boolean;
  loading: boolean;
  messageCount: number;
};

type UseChatScrollResult = {
  isAtLatest: boolean;
  messageListRef: RefObject<HTMLDivElement | null>;
  onMessageListScroll: () => void;
  prepareScrollRestore: () => boolean;
  requestScrollToLatest: () => void;
};

export const useChatScroll = ({
  hasError,
  loading,
  messageCount,
}: UseChatScrollParams): UseChatScrollResult => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const hasAppliedInitialScroll = useRef(false);
  const pendingScrollToLatest = useRef(false);
  const pendingScrollRestore = useRef<{
    previousScrollHeight: number;
    previousScrollTop: number;
  } | null>(null);
  const [isAtLatest, setIsAtLatest] = useState(true);

  useLayoutEffect(() => {
    if (!messageListRef.current || messageCount === 0) {
      return;
    }

    if (!hasAppliedInitialScroll.current && !loading && !hasError) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      hasAppliedInitialScroll.current = true;
      return;
    }

    if (pendingScrollRestore.current) {
      const { previousScrollHeight, previousScrollTop } = pendingScrollRestore.current;
      const nextScrollHeight = messageListRef.current.scrollHeight;

      messageListRef.current.scrollTop =
        previousScrollTop + (nextScrollHeight - previousScrollHeight);
      pendingScrollRestore.current = null;
      setIsAtLatest(isNearBottom(messageListRef.current));
      return;
    }

    if (pendingScrollToLatest.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      pendingScrollToLatest.current = false;
      setIsAtLatest(true);
      return;
    }

    setIsAtLatest(isNearBottom(messageListRef.current));
  }, [hasError, loading, messageCount]);

  return {
    isAtLatest,
    messageListRef,
    onMessageListScroll: () => {
      setIsAtLatest(isNearBottom(messageListRef.current));
    },
    prepareScrollRestore: () => {
      if (!messageListRef.current) {
        return false;
      }

      pendingScrollRestore.current = {
        previousScrollHeight: messageListRef.current.scrollHeight,
        previousScrollTop: messageListRef.current.scrollTop,
      };

      return true;
    },
    requestScrollToLatest: () => {
      pendingScrollToLatest.current = true;
    },
  };
};
