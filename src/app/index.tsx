import { ChatShell } from '../components/chat-shell';

import styles from './style.module.css';

export function App() {
  return (
    <main className={styles.app}>
      <ChatShell />
    </main>
  );
}
