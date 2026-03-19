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

  return (
    <section
      className={styles.viewport}
      aria-busy={loading || sending || undefined}
      aria-label="Chat conversation"
    >
      <p className={styles.visuallyHidden} role="status" aria-atomic="true">
        {loadingAnnouncement ?? ''}
      </p>
      <ChatShellContent
        loadErrorMessage={loadErrorMessage}
        loading={loading}
        messageItems={messageItems}
        messageListRef={messageListRef}
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
