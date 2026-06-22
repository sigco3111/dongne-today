import { type ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'red' | 'green' | 'yellow' | 'grey' | 'purple';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * 작은 상태 배지 — 공휴일/평일/주말/색상 카테고리용
 */
export function Badge({ children, variant = 'grey', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-tds-sm text-tds-st3 font-medium',
        variant === 'red' && 'bg-tds-red/10 text-tds-red',
        variant === 'green' && 'bg-tds-green/10 text-tds-green',
        variant === 'yellow' && 'bg-tds-yellow/20 text-tds-orange',
        variant === 'grey' && 'bg-tds-grey-100 text-tds-grey-700',
        variant === 'purple' && 'bg-tds-purple/10 text-tds-purple',
        className,
      )}
    >
      {children}
    </span>
  );
}