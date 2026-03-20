import { ChatIdentityPrompt } from '../../../components/chat-identity-prompt';
import { Composer } from '../../../components/composer';
import { ChatShellContent } from '../chat-shell-content';
import { useChatShell } from '../use-chat-shell';
import styles from './style.module.css';

export function ChatShell() {
  const {
    authorError,
    authorInputRef,
    authorPromptVisible,
    authorValue,
    composerError,
    composerInputDisabled,
    composerInputRef,
    composerPlaceholder,
    composerSubmitDisabled,
    composerSubmitLabel,
    composerValue,
    canLoadOlder,
    loadErrorMessage,
    loadOlderErrorMessage,
    loadingOlder,
    loadingAnnouncement,
    loading,
    messageItems,
    messageListRef,
    sending,
    onAuthorChange,
    onAuthorSubmit,
    onComposerChange,
    onComposerSubmit,
    onLoadOlderMessages,
    onMessageListScroll,
  } = useChatShell();

  return (
    <section
      className={styles.viewport}
      aria-busy={loading || loadingOlder || sending || undefined}
      aria-label="Chat conversation"
    >
      <p className={styles.visuallyHidden} role="status" aria-atomic="true">
        {loadingAnnouncement ?? ''}
      </p>
      <ChatShellContent
        canLoadOlder={canLoadOlder}
        loadErrorMessage={loadErrorMessage}
        loadOlderErrorMessage={loadOlderErrorMessage}
        loadingOlder={loadingOlder}
        loading={loading}
        messageItems={messageItems}
        messageListRef={messageListRef}
        onLoadOlderMessages={onLoadOlderMessages}
        onMessageListScroll={onMessageListScroll}
      />
      {authorPromptVisible ? (
        <ChatIdentityPrompt
          error={authorError}
          inputRef={authorInputRef}
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
        inputRef={composerInputRef}
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
