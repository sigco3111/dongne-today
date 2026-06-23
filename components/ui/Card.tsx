import { type ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'flat';
}

export function Card({ children, className, padding = 'md', variant = 'default' }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-tds-lg transition-all duration-200 ease-out',
        variant === 'default' && [
          'bg-tds-surface border border-tds-grey-200/70',
          'shadow-tds-sm',
          'hover:shadow-tds-md hover:-translate-y-0.5',
          'dark:border-tds-grey-200 dark:shadow-tds-md/30',
        ],
        variant === 'elevated' && [
          'bg-tds-surface-elevated',
          'shadow-tds-md',
          'hover:shadow-tds-lg hover:-translate-y-0.5',
        ],
        variant === 'flat' && 'bg-tds-grey-50/60 dark:bg-tds-grey-100/40',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-5',
        padding === 'lg' && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
