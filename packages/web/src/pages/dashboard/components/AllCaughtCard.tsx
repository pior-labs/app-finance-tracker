import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PILL_PRIMARY } from '../lib/constants';
import { ArrowIcon } from './ArrowIcon';
import { HugeNum } from './HugeNum';

export function AllCaughtCard({
  tagClass,
  tagText,
  mainNum,
  subText,
  copy,
  ctaTo,
  ctaLabel,
}: {
  tagClass: string;
  tagText: ReactNode;
  mainNum: string;
  subText: ReactNode;
  copy: ReactNode;
  ctaTo: string;
  ctaLabel: string;
}) {
  return (
    <section className="bloom-glass relative overflow-hidden rounded-[36px] p-5 sm:p-7 lg:p-9">
      <div className="action-bg all-caught" />
      <div className="relative z-1">
        <div
          className={[
            'inline-flex items-center gap-1.5 rounded-full border border-white/60 px-3.5 py-1.5 text-[13px] font-medium',
            tagClass,
          ].join(' ')}
        >
          {tagText}
        </div>
        <HugeNum value={mainNum}>{subText}</HugeNum>
        <p className="mb-4 mt-0 max-w-120 font-serif text-[17px] font-normal leading-normal text-ink-2 sm:text-[19px]">
          {copy}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link to={ctaTo} className={PILL_PRIMARY}>
            {ctaLabel} <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
