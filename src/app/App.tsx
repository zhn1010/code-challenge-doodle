import { ChatShell } from '../components/chat-shell/ChatShell';

import styles from './App.module.css';

export function App() {
  return (
    <main className={styles.app}>
      <ChatShell />
    </main>
  );
}
