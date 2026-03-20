import styles from './style.module.css';

type SkeletonLineProps = {
  className?: string;
};

export function SkeletonLine({ className }: SkeletonLineProps) {
  const lineClassName = className ? `${styles.line} ${className}` : styles.line;

  return <div className={lineClassName} />;
}
