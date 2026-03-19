import type { FormEvent } from 'react';

import styles from './style.module.css';

type ComposerProps = {
  disabled?: boolean;
  inputDisabled?: boolean;
  placeholder?: string;
  submitDisabled?: boolean;
  submitLabel?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function Composer({
  disabled = false,
  inputDisabled,
  placeholder = 'Message',
  submitDisabled,
  submitLabel = 'Send',
  value = '',
  onChange,
  onSubmit,
}: ComposerProps) {
  const isInputDisabled = inputDisabled ?? disabled;
  const isSubmitDisabled = submitDisabled ?? disabled;

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
        disabled={isInputDisabled}
        readOnly={onChange === undefined}
      />
      <button className={styles.send} type="submit" disabled={isSubmitDisabled}>
        {submitLabel}
      </button>
    </form>
  );
}
