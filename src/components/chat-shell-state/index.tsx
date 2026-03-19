import styles from './style.module.css';

type ChatShellStateProps = {
  title: string;
  body: string;
  tone?: 'neutral' | 'error';
};

export function ChatShellState({ title, body, tone = 'neutral' }: ChatShellStateProps) {
  const cardClassName =
    tone === 'error' ? `${styles.stateCard} ${styles.stateCardError}` : styles.stateCard;

  return (
    <div
      className={styles.state}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <div className={cardClassName}>
        <p className={styles.stateTitle}>{title}</p>
        <p className={styles.stateBody}>{body}</p>
      </div>
    </div>
  );
}
