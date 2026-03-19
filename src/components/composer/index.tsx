import type { FormEvent } from 'react';

import styles from './style.module.css';

type ComposerProps = {
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function Composer({
  disabled = false,
  placeholder = 'Message',
  submitLabel = 'Send',
  value = '',
  onChange,
  onSubmit,
}: ComposerProps) {
  return (
    <form className={styles.composer} aria-label="Message composer" onSubmit={onSubmit}>
      <label className={styles.label} htmlFor="message">
        Message
      </label>
      <input
        id="message"
        className={styles.input}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        readOnly={onChange === undefined}
      />
      <button className={styles.send} type="submit" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}
