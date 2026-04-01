import { useLayoutEffect, useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';

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

export type ChatScrollState = {
  isAtLatest: boolean;
  messageListRef: RefObject<HTMLDivElement | null>;
  onMessageListScroll: () => void;
  pendingScrollRestoreRef: RefObject<{
    previousScrollHeight: number;
    previousScrollTop: number;
  } | null>;
  pendingScrollToLatestRef: RefObject<boolean>;
  prepareScrollRestore: () => boolean;
  requestScrollToLatest: () => void;
  setIsAtLatest: Dispatch<SetStateAction<boolean>>;
};

type UseChatScrollEffectParams = {
  hasError: boolean;
  loading: boolean;
  messageCount: number;
  messageListRef: RefObject<HTMLDivElement | null>;
  pendingScrollRestoreRef: RefObject<{
    previousScrollHeight: number;
    previousScrollTop: number;
  } | null>;
  pendingScrollToLatestRef: RefObject<boolean>;
  setIsAtLatest: Dispatch<SetStateAction<boolean>>;
};

export const useChatScrollState = (): ChatScrollState => {
  const messageListRef = useRef<HTMLDivElement>(null);
  const pendingScrollToLatestRef = useRef(true);
  const pendingScrollRestoreRef = useRef<{
    previousScrollHeight: number;
    previousScrollTop: number;
  } | null>(null);
  const [isAtLatest, setIsAtLatest] = useState(true);

  return {
    isAtLatest,
    messageListRef,
    onMessageListScroll: () => {
      setIsAtLatest(isNearBottom(messageListRef.current));
    },
    pendingScrollRestoreRef,
    pendingScrollToLatestRef,
    prepareScrollRestore: () => {
      if (!messageListRef.current) {
        return false;
      }

      pendingScrollRestoreRef.current = {
        previousScrollHeight: messageListRef.current.scrollHeight,
        previousScrollTop: messageListRef.current.scrollTop,
      };

      return true;
    },
    requestScrollToLatest: () => {
      pendingScrollToLatestRef.current = true;
    },
    setIsAtLatest,
  };
};

export const useChatScrollEffect = ({
  hasError,
  loading,
  messageCount,
  messageListRef,
  pendingScrollRestoreRef,
  pendingScrollToLatestRef,
  setIsAtLatest,
}: UseChatScrollEffectParams): void => {
  useLayoutEffect(() => {
    const messageListElement = messageListRef.current;

    if (!messageListElement || messageCount === 0) {
      return;
    }

    if (pendingScrollRestoreRef.current) {
      const { previousScrollHeight, previousScrollTop } = pendingScrollRestoreRef.current;
      const nextScrollHeight = messageListElement.scrollHeight;

      messageListElement.scrollTop = previousScrollTop + (nextScrollHeight - previousScrollHeight);
      pendingScrollRestoreRef.current = null;
      setIsAtLatest(isNearBottom(messageListElement));
      return;
    }

    if (pendingScrollToLatestRef.current) {
      messageListElement.scrollTop = messageListElement.scrollHeight;
      pendingScrollToLatestRef.current = false;
      setIsAtLatest(true);
      return;
    }

    setIsAtLatest(isNearBottom(messageListElement));
  }, [
    hasError,
    loading,
    messageCount,
    messageListRef,
    pendingScrollRestoreRef,
    pendingScrollToLatestRef,
    setIsAtLatest,
  ]);
};
