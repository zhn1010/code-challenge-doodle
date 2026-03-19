import type { FormEvent, Ref } from 'react';

import styles from './style.module.css';

type ComposerProps = {
  describedBy?: string;
  disabled?: boolean;
  inputDisabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  invalid?: boolean;
  placeholder?: string;
  submitDisabled?: boolean;
  submitLabel?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function Composer({
  describedBy,
  disabled = false,
  inputDisabled,
  inputRef,
  invalid = false,
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
      <div className={styles.inner}>
        <label className={styles.label} htmlFor="message">
          Message
        </label>
        <input
          id="message"
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={styles.input}
          ref={inputRef}
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
      </div>
    </form>
  );
}
