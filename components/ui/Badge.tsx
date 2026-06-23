import { type ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'red' | 'green' | 'yellow' | 'grey' | 'purple' | 'blue';

export function Badge({ children, variant = 'grey' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-tds-pill text-tds-st3 font-medium tracking-tight',
        variant === 'red' && 'bg-tds-red/10 text-tds-red',
        variant === 'green' && 'bg-tds-green/10 text-tds-green',
        variant === 'yellow' && 'bg-tds-yellow/20 text-tds-orange',
        variant === 'blue' && 'bg-tds-blue/10 text-tds-blue',
        variant === 'grey' && 'bg-tds-grey-100 text-tds-grey-700',
        variant === 'purple' && 'bg-tds-purple/10 text-tds-purple',
      )}
    >
      {children}
    </span>
  );
}
