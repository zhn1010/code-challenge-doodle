import { ChatIdentityPrompt } from '../../../components/chat-identity-prompt';
import { ChatShellState } from '../../../components/chat-shell-state';
import { Composer } from '../../../components/composer';
import { MessageList } from '../../../components/message-list';
import { MessageListSkeleton } from '../../../components/message-list-skeleton';
import { useChatShell } from '../use-chat-shell';
import styles from './style.module.css';

export function ChatShell() {
  const {
    authorError,
    authorPromptVisible,
    authorValue,
    composerError,
    composerInputDisabled,
    composerPlaceholder,
    composerSubmitDisabled,
    composerSubmitLabel,
    composerValue,
    loadErrorMessage,
    loading,
    messageItems,
    messageListRef,
    onAuthorChange,
    onAuthorSubmit,
    onComposerChange,
    onComposerSubmit,
  } = useChatShell();

  const content = (() => {
    if (loading) {
      return <MessageListSkeleton />;
    }

    if (loadErrorMessage) {
      return (
        <ChatShellState title="Could not load messages" body={loadErrorMessage} tone="error" />
      );
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
  })();

  return (
    <section className={styles.viewport} aria-label="Chat layout preview">
      {content}
      {authorPromptVisible ? (
        <ChatIdentityPrompt
          error={authorError}
          value={authorValue}
          onChange={onAuthorChange}
          onSubmit={onAuthorSubmit}
        />
      ) : null}
      {composerError ? <p className={styles.composerStatus}>{composerError}</p> : null}
      <Composer
        inputDisabled={composerInputDisabled}
        placeholder={composerPlaceholder}
        submitDisabled={composerSubmitDisabled}
        submitLabel={composerSubmitLabel}
        value={composerValue}
        onChange={onComposerChange}
        onSubmit={onComposerSubmit}
      />
    </section>
  );
}
