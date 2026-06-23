'use client';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'weak' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 font-medium',
        'rounded-tds-md transition-all duration-200 ease-out',
        'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-1.5 text-tds-st3',
        size === 'md' && 'px-4 py-2.5 text-tds-st2',
        variant === 'primary' && [
          'bg-tds-blue text-white',
          'hover:bg-tds-blue-dark hover:shadow-tds-md',
        ],
        variant === 'weak' && [
          'bg-tds-grey-100 text-tds-grey-900',
          'hover:bg-tds-grey-200',
          'dark:bg-tds-grey-100 dark:hover:bg-tds-grey-200',
        ],
        variant === 'ghost' && [
          'text-tds-blue',
          'hover:bg-tds-blue-light',
          'dark:hover:bg-tds-blue-light/20',
        ],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
