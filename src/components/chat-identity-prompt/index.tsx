import type { Ref, SyntheticEvent } from 'react';

import styles from './style.module.css';

type ChatIdentityPromptProps = {
  error?: string | null;
  inputRef?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
};

export function ChatIdentityPrompt({
  error,
  inputRef,
  value,
  onChange,
  onSubmit,
}: ChatIdentityPromptProps) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-author-title"
      aria-describedby="chat-author-description"
    >
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 id="chat-author-title" className={styles.title}>
          Choose your display name
        </h1>
        <p id="chat-author-description" className={styles.body}>
          The API requires an author for each message. We will use this name to mark your own
          messages as outgoing.
        </p>
        <label className={styles.label} htmlFor="chat-author">
          Display name
        </label>
        <input
          id="chat-author"
          aria-describedby={error ? 'chat-author-error' : 'chat-author-description'}
          aria-invalid={Boolean(error) || undefined}
          className={styles.input}
          ref={inputRef}
          type="text"
          autoComplete="name"
          maxLength={50}
          placeholder="Your name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {error ? (
          <p id="chat-author-error" className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.button} type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}
