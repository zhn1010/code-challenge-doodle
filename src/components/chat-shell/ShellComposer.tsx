import styles from './ShellComposer.module.css';

export function ShellComposer() {
  return (
    <form className={styles.composer} aria-label="Message composer">
      <label className={styles.label} htmlFor="message">
        Message
      </label>
      <input id="message" className={styles.input} type="text" placeholder="Message" disabled />
      <button className={styles.send} type="submit" disabled>
        Send
      </button>
    </form>
  );
}
