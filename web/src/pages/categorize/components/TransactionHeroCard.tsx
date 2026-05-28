import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { formatMoney, formatShortDate, prettyName, splitMoney } from '../lib/format';
import type { Category, Transaction } from '../types';
import { CategoryPicker } from './CategoryPicker';
import { KeyHint } from './KeyHint';

interface TransactionHeroCardProps {
  current: Transaction;
  categories: Category[];
  favoriteCategories: Category[];
  isLocked: boolean;
  positionInBatch: number;
  batchTotal: number;
  onAssign: (categoryId: number) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const TransactionHeroCard = memo(function TransactionHeroCard({
  current,
  categories,
  favoriteCategories,
  isLocked,
  positionInBatch,
  batchTotal,
  onAssign,
  onBack,
  onSkip,
}: TransactionHeroCardProps) {
  const { whole, cents } = splitMoney(current.amount);
  const isCredit = current.type === 'credit';

  return (
    <div
      className="relative z-30 rounded-[28px] border sm:rounded-[36px]"
      style={{
        background: 'rgba(255,253,247,0.6)',
        borderColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(28px) saturate(150%)',
        WebkitBackdropFilter: 'blur(28px) saturate(150%)',
        boxShadow: '0 20px 60px -15px rgba(45,36,24,0.14), inset 0 0 0 1px rgba(255,255,255,0.5)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[36px]"
        style={{
          background: isCredit
            ? 'radial-gradient(ellipse at 0% 0%, rgba(202,224,168,0.6), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(198,227,212,0.4), transparent 50%)'
            : 'radial-gradient(ellipse at 0% 0%, rgba(248,215,192,0.6), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(245,227,160,0.4), transparent 50%)',
        }}
      />

      <div
        key={current.id}
        className="categorize-content relative z-1"
        data-leaving={isLocked ? 'true' : undefined}
        aria-live="polite"
      >
        <div className="flex flex-col gap-3 px-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-7 sm:pt-8 md:px-9">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
              {formatShortDate(current.date)}
            </span>
            <span
              className="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: 'rgba(255,255,255,0.6)',
                background: isCredit ? 'rgba(202,224,168,0.7)' : 'rgba(248,215,192,0.7)',
                color: isCredit ? '#3d6b1f' : 'var(--ink-2)',
              }}
            >
              {isCredit ? '↑ credit' : '↓ debit'}
            </span>
          </div>
          <div
            className="text-[44px] font-normal leading-none tracking-tight tabular-nums sm:text-[52px] md:text-[64px]"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)', fontFeatureSettings: "'lnum', 'tnum'" }}
            aria-label={`${isCredit ? 'Credit' : 'Debit'} ${formatMoney(current.amount)}`}
          >
            <span className="align-top text-[26px] sm:text-[30px] md:text-4xl" style={{ color: 'var(--ink-3)' }}>
              {isCredit ? '+' : '−'}
            </span>
            <span className="align-top text-[22px] sm:text-[26px] md:text-[32px]" style={{ color: 'var(--ink-3)' }}>$</span>
            {whole}
            <span className="text-[20px] sm:text-[24px] md:text-[28px]" style={{ color: 'var(--ink-3)' }}>.{cents}</span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5 md:px-9 md:pb-7">
          <h2
            className="m-0 text-[26px] font-normal leading-tight tracking-tight sm:text-[32px] md:text-[38px]"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            {prettyName(current.merchant ?? current.description)}
          </h2>
          {current.merchant ? (
            <p className="m-0 mt-1.5 max-w-125 truncate text-[13px] sm:text-sm" style={{ color: 'var(--ink-3)' }}>
              {current.description}
            </p>
          ) : null}
        </div>
      </div>

      <CategoryPicker
        categories={categories}
        favoriteCategories={favoriteCategories}
        isLocked={isLocked}
        onAssign={onAssign}
      />

      <div
        className="relative z-1 flex items-center justify-between gap-3 rounded-b-[28px] border-t border-dashed px-4 py-3 sm:gap-4 sm:rounded-b-[36px] sm:px-8 sm:py-4"
        style={{ borderColor: 'rgba(45,36,24,0.1)', background: 'rgba(255,255,255,0.25)' }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Previous transaction"
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50 sm:px-4"
          style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-3)', touchAction: 'manipulation' }}
        >
          <span aria-hidden="true" className="hidden md:inline-flex"><KeyHint char="←" /></span>
          <span aria-hidden="true" className="text-base md:hidden">←</span>
          <span className="hidden sm:inline">Back</span>
        </button>
        <div
          className="text-[12px] italic tabular-nums sm:text-[13px]"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
        >
          {positionInBatch} of {batchTotal}
        </div>
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip transaction"
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0 sm:px-5"
          style={{
            fontFamily: "'Outfit', sans-serif",
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: 0,
            boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
            touchAction: 'manipulation',
          }}
        >
          Skip{' '}
          <span
            aria-hidden="true"
            className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-md text-xs font-medium"
            style={{
              fontFamily: "'Fraunces', serif",
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(253,249,240,0.8)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </div>
  );
});
