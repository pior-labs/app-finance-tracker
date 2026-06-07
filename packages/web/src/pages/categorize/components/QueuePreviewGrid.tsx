import { memo } from 'react';
import { Check } from 'lucide-react';
import { formatMoney, formatShortDate, lighten, prettyName } from '../lib/format';
import type { ConfirmedItem, Transaction, UndoAction } from '../types';
import { KeyHint } from './KeyHint';

interface QueuePreviewGridProps {
  upNext: Transaction[];
  confirmedList: ConfirmedItem[];
  undoStack: UndoAction[];
  isLocked: boolean;
  onUndo: () => void;
}

export const QueuePreviewGrid = memo(function QueuePreviewGrid({
  upNext,
  confirmedList,
  undoStack,
  isLocked,
  onUndo,
}: QueuePreviewGridProps) {
  const upNextPreview = upNext.slice(0, 4);
  const confirmedTop = confirmedList.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
      <div
        className="rounded-[20px] border p-4 sm:rounded-3xl sm:p-5"
        style={{
          background: 'rgba(255,253,247,0.45)',
          borderColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px) saturate(140%)',
          boxShadow: '0 8px 28px -8px rgba(45,36,24,0.08)',
        }}
      >
        <div
          className="mb-3.5 flex items-center justify-between border-b border-dashed pb-2.5"
          style={{ borderColor: 'rgba(45,36,24,0.1)' }}
        >
          <span
            className="text-[13px] italic"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
          >
            Up next
          </span>
          {upNext.length > 4 ? (
            <span
              className="rounded-full bg-[rgba(45,36,24,0.06)] px-2.5 py-0.5 text-xs not-italic"
              style={{ color: 'var(--ink-3)' }}
            >
              +{upNext.length - 4} more
            </span>
          ) : null}
        </div>
        <div className="flex min-h-55 flex-col">
          {upNextPreview.length === 0 ? (
            <p className="m-auto py-4 text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
              That's the last one in the queue.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {upNextPreview.map((tx) => (
                <div
                  key={tx.id}
                  className="grid items-center gap-2.5 rounded-xl px-1.5 py-2"
                  style={{ gridTemplateColumns: '8px 1fr auto' }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: tx.type === 'credit' ? '#cae0a8' : '#f8d7c0',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)',
                    }}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                      {prettyName(tx.merchant ?? tx.description)}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                      {formatShortDate(tx.date)}
                    </span>
                  </div>
                  <span
                    className="shrink-0 text-sm font-medium"
                    style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}
                  >
                    {tx.type === 'credit' ? '+' : '−'}{formatMoney(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-[20px] border p-4 sm:rounded-3xl sm:p-5"
        style={{
          background: 'rgba(255,253,247,0.45)',
          borderColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px) saturate(140%)',
          boxShadow: '0 8px 28px -8px rgba(45,36,24,0.08)',
        }}
      >
        <div
          className="mb-3.5 flex items-center justify-between border-b border-dashed pb-2.5"
          style={{ borderColor: 'rgba(45,36,24,0.1)' }}
        >
          <span
            className="text-[13px] italic"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
          >
            Just confirmed
          </span>
          <button
            type="button"
            onClick={onUndo}
            disabled={undoStack.length === 0 || isLocked}
            aria-label="Undo last categorization"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] not-italic transition-all enabled:cursor-pointer enabled:hover:-translate-y-px enabled:hover:bg-white/90 disabled:cursor-default disabled:opacity-35 motion-reduce:enabled:hover:translate-y-0 sm:text-[11px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: 'var(--ink-2)',
              background: 'rgba(255,255,255,0.6)',
              borderColor: 'rgba(255,255,255,0.8)',
              touchAction: 'manipulation',
            }}
          >
            <span className="hidden md:inline-flex"><KeyHint char="U" /></span>
            undo
          </button>
        </div>
        <div className="flex min-h-55 flex-col">
          {confirmedTop.length === 0 ? (
            <p className="m-auto py-4 text-center text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
              Assign a category to see confirmations here.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {confirmedTop.map((item, i) => (
                <div
                  key={`${item.txId}-${i}`}
                  className="grid items-center gap-2 rounded-xl px-1.5 py-2"
                  style={{ gridTemplateColumns: '18px 1fr auto' }}
                >
                  <span
                    className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${lighten(item.categoryColor, 0.3)}, ${item.categoryColor})` }}
                  >
                    <Check aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={2.8} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                      {prettyName(item.merchant)}
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-[11px] italic"
                      style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: item.categoryColor }}
                      />
                      {item.category}
                    </div>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-2)' }}
                  >
                    {item.type === 'credit' ? '+' : '−'}{formatMoney(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
