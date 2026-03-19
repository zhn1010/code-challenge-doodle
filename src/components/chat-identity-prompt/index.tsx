import type { FormEvent } from 'react';

import styles from './style.module.css';

type ChatIdentityPromptProps = {
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatIdentityPrompt({ error, value, onChange, onSubmit }: ChatIdentityPromptProps) {
  return (
    <div className={styles.overlay}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>Choose your display name</h1>
        <p className={styles.body}>
          The API requires an author for each message. We will use this name to mark your own
          messages as outgoing.
        </p>
        <label className={styles.label} htmlFor="chat-author">
          Display name
        </label>
        <input
          id="chat-author"
          className={styles.input}
          type="text"
          autoComplete="name"
          maxLength={50}
          placeholder="Your name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.button} type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}
