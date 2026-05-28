import type { ReactNode } from 'react';

export function HugeNum({ value, children }: { value: number | string; children: ReactNode }) {
  return (
    <div className="my-3 flex flex-wrap items-end gap-3 font-serif text-[84px] font-light leading-[0.9] tracking-tighter text-ink sm:text-[120px] sm:gap-4 lg:text-[168px] lg:gap-4.5">
      {value}
      <span className="pb-1.5 font-sans text-base font-normal leading-tight tracking-normal text-ink-2 sm:pb-3 sm:text-lg lg:pb-4.5">
        {children}
      </span>
    </div>
  );
}
