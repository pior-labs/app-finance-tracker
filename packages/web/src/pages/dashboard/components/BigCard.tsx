import type { ReactNode } from 'react';

export function BigCard({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="theme-glass relative rounded-[26px] p-5 sm:rounded-4xl sm:p-8">
      <div className="mb-5.5">
        <h2 className="m-0 font-serif text-[22px] font-normal leading-[1.1] tracking-[-0.02em] text-ink sm:text-[28px]">
          {title}
        </h2>
        <span className="mt-0.5 block font-serif text-sm italic text-ink-3">{sub}</span>
      </div>
      {children}
    </div>
  );
}
