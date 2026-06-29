import type { ReactNode } from 'react';

export function StatCard({
  tint,
  children,
}: {
  tint: 'tone-card-1' | 'tone-card-2' | 'tone-card-3';
  children: ReactNode;
}) {
  return (
    <div
      className={[
        tint,
        'relative flex min-h-0 flex-col overflow-hidden rounded-[26px] border border-frost/80 p-5.5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_12px_36px_-10px_rgba(45,36,24,0.1)] sm:min-h-50 sm:rounded-[30px] sm:p-7',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
