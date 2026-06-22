import { type ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * 기본 카드 컨테이너 — TDS 디자인 토큰 사용
 * - 배경: tds-bg (라이트/다크 자동)
 * - 테두리: tds-grey-200
 * - 라운드: tds-lg (16px)
 */
export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-tds-lg bg-tds-bg border border-tds-grey-200',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}