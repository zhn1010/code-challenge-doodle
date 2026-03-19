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
    loadingAnnouncement,
    loading,
    messageItems,
    messageListRef,
    sending,
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
    <section
      className={styles.viewport}
      aria-busy={loading || sending || undefined}
      aria-label="Chat conversation"
    >
      {loadingAnnouncement ? (
        <p className={styles.visuallyHidden} role="status" aria-atomic="true">
          {loadingAnnouncement}
        </p>
      ) : null}
      {content}
      {authorPromptVisible ? (
        <ChatIdentityPrompt
          error={authorError}
          value={authorValue}
          onChange={onAuthorChange}
          onSubmit={onAuthorSubmit}
        />
      ) : null}
      {composerError ? (
        <p id="composer-error" className={styles.composerStatus} role="alert">
          {composerError}
        </p>
      ) : null}
      <Composer
        describedBy={composerError ? 'composer-error' : undefined}
        inputDisabled={composerInputDisabled}
        invalid={Boolean(composerError)}
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
