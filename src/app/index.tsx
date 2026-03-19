import { ChatShell } from '../features/chat/chat-shell';

import styles from './style.module.css';

export function App() {
  return (
    <main className={styles.app}>
      <ChatShell />
    </main>
  );
}
