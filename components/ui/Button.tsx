'use client';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'weak' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * TDS 스타일 버튼 — primary/weak/ghost 3종
 * - primary: 메인 CTA (토스 블루)
 * - weak: 보조 액션 (회색 배경)
 * - ghost: 텍스트형 (호버 시 연한 블루 배경)
 */
export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-tds-md px-4 py-2 text-tds-st2 font-medium transition-colors',
        variant === 'primary' && 'bg-tds-blue text-white hover:bg-tds-blue-dark',
        variant === 'weak' && 'bg-tds-grey-100 text-tds-grey-900 hover:bg-tds-grey-200',
        variant === 'ghost' && 'text-tds-blue hover:bg-tds-blue-light',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}