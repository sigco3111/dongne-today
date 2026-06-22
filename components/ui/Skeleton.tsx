import clsx from 'clsx';

export interface SkeletonProps {
  className?: string;
}

/**
 * 데이터 로딩 중 회색 박스 placeholder
 * - animate-pulse로 깜빡임
 * - size/shape은 className으로 제어 (예: "h-32", "rounded-full")
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx('animate-pulse bg-tds-grey-100 rounded', className)} />;
}