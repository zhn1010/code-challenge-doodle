import { ShellMessage } from './ShellMessage';
import styles from './MessagePreviewList.module.css';

const previewMessages = [
  {
    author: 'Luka',
    body: "I created the poll for next week's lunch.",
    meta: '10 Mar 2018 09:55',
    variant: 'incoming' as const,
  },
  {
    author: 'Nina',
    body: "Great, thanks. I'll add my availability today.",
    meta: '10 Mar 2018 10:10',
    variant: 'incoming' as const,
  },
  {
    author: 'Patricia',
    body: 'That works for me.',
    meta: '10 Mar 2018 10:22',
    variant: 'incoming' as const,
  },
  {
    body: "Perfect. I'll confirm once everyone has voted.",
    meta: '12 Mar 2018 14:38',
    variant: 'outgoing' as const,
  },
];

export function MessagePreviewList() {
  return (
    <div className={styles.messages} aria-hidden="true">
      <div className={styles.stack}>
        {previewMessages.map((message) => (
          <ShellMessage
            key={`${message.meta}-${message.body}`}
            author={message.author}
            body={message.body}
            meta={message.meta}
            variant={message.variant}
          />
        ))}
      </div>
    </div>
  );
}
