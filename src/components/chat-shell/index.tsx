import { Composer } from '../composer';
import { MessageList } from '../message-list';
import type { ChatMessageItem } from '../../features/chat/types';
import styles from './style.module.css';

const sampleMessages: ChatMessageItem[] = [
  {
    id: 'message-1',
    author: 'Luka',
    body: "I created the poll for next week's lunch.",
    timestamp: '10 Mar 2018 09:55',
    variant: 'incoming',
  },
  {
    id: 'message-2',
    author: 'Nina',
    body: "Great, thanks. I'll add my availability today.",
    timestamp: '10 Mar 2018 10:10',
    variant: 'incoming',
  },
  {
    id: 'message-3',
    author: 'Patricia',
    body: 'That works for me.',
    timestamp: '10 Mar 2018 10:22',
    variant: 'incoming',
  },
  {
    id: 'message-4',
    body: "Perfect. I'll confirm once everyone has voted.",
    timestamp: '12 Mar 2018 14:38',
    variant: 'outgoing',
  },
];

export function ChatShell() {
  return (
    <section className={styles.viewport} aria-label="Chat layout preview">
      <MessageList messages={sampleMessages} />
      <Composer disabled value="" />
    </section>
  );
}
