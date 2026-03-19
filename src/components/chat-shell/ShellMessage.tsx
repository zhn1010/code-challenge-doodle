import styles from './ShellMessage.module.css';

type ShellMessageProps = {
  author?: string;
  body: string;
  meta: string;
  variant: 'incoming' | 'outgoing';
};

export function ShellMessage({ author, body, meta, variant }: ShellMessageProps) {
  const className = `${styles.message} ${
    variant === 'outgoing' ? styles.outgoing : styles.incoming
  }`;

  return (
    <article className={className}>
      {author ? <p className={styles.author}>{author}</p> : null}
      <p className={styles.body}>{body}</p>
      <p className={styles.meta}>{meta}</p>
    </article>
  );
}
