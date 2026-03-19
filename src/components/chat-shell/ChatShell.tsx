import type { CSSProperties } from 'react';

import bodyBackgroundUrl from '../../../assets/Body BG.png';

import { MessagePreviewList } from './MessagePreviewList';
import { ShellComposer } from './ShellComposer';
import styles from './ChatShell.module.css';

export function ChatShell() {
  return (
    <section className={styles.shell} aria-label="Chat layout preview">
      <div
        className={styles.viewport}
        style={{ '--chat-background-image': `url("${bodyBackgroundUrl}")` } as CSSProperties}
      >
        <MessagePreviewList />
        <ShellComposer />
      </div>
    </section>
  );
}
