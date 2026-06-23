import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse-soft rounded-tds-md',
        'bg-gradient-to-r from-tds-grey-100 via-tds-grey-200/50 to-tds-grey-100',
        'dark:from-tds-grey-100 dark:via-tds-grey-200/50 dark:to-tds-grey-100',
        className,
      )}
    />
  );
}
