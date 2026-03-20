import { SkeletonLine } from '../skeleton-line';
import styles from './style.module.css';

type SkeletonLineWidth = 'wide' | 'medium' | 'short';
type SkeletonItem = {
  id: string;
  variant: 'incoming' | 'outgoing';
  lines: SkeletonLineWidth[];
};

const skeletonItems: SkeletonItem[] = [
  { id: 'skeleton-1', variant: 'incoming', lines: ['wide', 'medium'] },
  { id: 'skeleton-2', variant: 'incoming', lines: ['short'] },
  { id: 'skeleton-3', variant: 'incoming', lines: ['medium', 'short'] },
  { id: 'skeleton-4', variant: 'incoming', lines: ['wide', 'medium'] },
];

const lineWidthClassNames: Record<SkeletonLineWidth, string> = {
  wide: styles.skeletonLineWide,
  medium: styles.skeletonLineMedium,
  short: styles.skeletonLineShort,
};

export function MessageListSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.content}>
        <div className={styles.skeletonStack}>
          {skeletonItems.map((item) => {
            const bubbleClassName =
              item.variant === 'outgoing'
                ? `${styles.skeletonBubble} ${styles.skeletonBubbleOutgoing}`
                : styles.skeletonBubble;

            return (
              <div key={item.id} className={bubbleClassName}>
                {item.variant === 'incoming' ? (
                  <SkeletonLine className={styles.skeletonAuthor} />
                ) : null}
                {item.lines.map((line) => (
                  <SkeletonLine key={`${item.id}-${line}`} className={lineWidthClassNames[line]} />
                ))}
                <SkeletonLine className={styles.skeletonMeta} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
