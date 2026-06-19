import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE } from '../lib/constants';

interface TransactionsPaginationProps {
  offset: number;
  total: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const TransactionsPagination = memo(function TransactionsPagination({
  offset,
  total,
  onPreviousPage,
  onNextPage,
}: TransactionsPaginationProps) {
  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrevious = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  return (
    <div className="flex flex-col-reverse items-stretch gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-center text-[12px] sm:text-left sm:text-[13px]" style={{ color: 'var(--ink-3)' }}>
        {total > 0 ? (
          <>
            Showing{' '}
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: 'var(--ink-2)' }}>
              {offset + 1}-{Math.min(offset + PAGE_SIZE, total)}
            </span>
            {' '}of{' '}
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: 'var(--ink-2)' }}>
              {total}
            </span>
          </>
        ) : null}
      </span>
      <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-2.5">
        {canGoPrevious ? (
          <button
            type="button"
            onClick={onPreviousPage}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-frost/50"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: 'var(--ink-2)',
              borderColor: 'rgba(45,36,24,0.15)',
              background: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
            prev
          </button>
        ) : (
          <span aria-hidden="true" className="min-h-11 sm:hidden" />
        )}
        <span
          className="shrink-0 text-[13px] italic"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
        >
          {pageNumber} of {totalPages}
        </span>
        {canGoNext ? (
          <button
            type="button"
            onClick={onNextPage}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: 0,
              boxShadow: '0 6px 18px -6px rgba(45,36,24,0.35)',
              touchAction: 'manipulation',
            }}
          >
            next
            <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
          </button>
        ) : (
          <span aria-hidden="true" className="min-h-11 sm:hidden" />
        )}
      </div>
    </div>
  );
});
