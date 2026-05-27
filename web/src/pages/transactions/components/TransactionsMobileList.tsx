import { memo, type RefObject } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatAmount, formatShortDate, prettyName } from '../lib/format';
import type { SelectOption, TransactionListItem } from '../types';
import { CategorySelect } from './TransactionsDesktopTable';
import { TransactionStatusPill } from './TransactionStatusPill';

const MOBILE_SKELETON_CARDS = [0, 1, 2, 3, 4];

interface TransactionsMobileListProps {
  transactions: TransactionListItem[];
  loading: boolean;
  rowRefs: RefObject<Map<number, HTMLElement>>;
  rowCategoryOptions: SelectOption[];
  updatingTransactionIds: Set<number>;
  deletingTransactionIds: Set<number>;
  categoryColorMap: Map<number, string>;
  focusedRowId: number | null;
  onCategoryAssign: (transaction: TransactionListItem, value: string) => void;
  onEditTransaction: (transaction: TransactionListItem) => void;
  onDeleteTransaction: (transaction: TransactionListItem) => void;
}

export const TransactionsMobileList = memo(function TransactionsMobileList({
  transactions,
  loading,
  rowRefs,
  rowCategoryOptions,
  updatingTransactionIds,
  deletingTransactionIds,
  categoryColorMap,
  focusedRowId,
  onCategoryAssign,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsMobileListProps) {
  return (
    <div
      className="flex flex-col gap-2.5 md:hidden"
      role={loading ? 'status' : undefined}
      aria-live={loading ? 'polite' : undefined}
      aria-busy={loading}
    >
      {loading ? <span className="sr-only">Loading transactions...</span> : null}
      {loading ? (
        MOBILE_SKELETON_CARDS.map((index) => (
          <div
            key={index}
            aria-hidden="true"
            className="rounded-[20px] border p-4"
            style={{
              background: 'rgba(255,253,247,0.55)',
              borderColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            }}
          >
            <div
              className="h-3.5 animate-pulse rounded-full motion-reduce:animate-none"
              style={{
                background: 'rgba(45,36,24,0.06)',
                width: `${60 + (index % 3) * 12}%`,
                animationDelay: `${index * 0.08}s`,
              }}
            />
            <div
              className="mt-2.5 h-3 w-1/2 animate-pulse rounded-full motion-reduce:animate-none"
              style={{ background: 'rgba(45,36,24,0.05)', animationDelay: `${index * 0.08 + 0.05}s` }}
            />
          </div>
        ))
      ) : transactions.length === 0 ? (
        <div
          className="rounded-3xl border px-5 py-12 text-center"
          style={{
            background: 'rgba(255,253,247,0.55)',
            borderColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          }}
        >
          <p className="m-0 text-[15px] italic" style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}>
            No transactions found.
          </p>
        </div>
      ) : (
        transactions.map((transaction) => (
          <TransactionsMobileCard
            key={transaction.id}
            transaction={transaction}
            rowRefs={rowRefs}
            rowCategoryOptions={rowCategoryOptions}
            isUpdating={updatingTransactionIds.has(transaction.id)}
            isDeleting={deletingTransactionIds.has(transaction.id)}
            categoryColor={transaction.categoryId ? categoryColorMap.get(transaction.categoryId) : undefined}
            isFocused={focusedRowId === transaction.id}
            onCategoryAssign={onCategoryAssign}
            onEditTransaction={onEditTransaction}
            onDeleteTransaction={onDeleteTransaction}
          />
        ))
      )}
    </div>
  );
});

interface TransactionsMobileCardProps {
  transaction: TransactionListItem;
  rowRefs: RefObject<Map<number, HTMLElement>>;
  rowCategoryOptions: SelectOption[];
  isUpdating: boolean;
  isDeleting: boolean;
  categoryColor?: string;
  isFocused: boolean;
  onCategoryAssign: (transaction: TransactionListItem, value: string) => void;
  onEditTransaction: (transaction: TransactionListItem) => void;
  onDeleteTransaction: (transaction: TransactionListItem) => void;
}

const TransactionsMobileCard = memo(function TransactionsMobileCard({
  transaction,
  rowRefs,
  rowCategoryOptions,
  isUpdating,
  isDeleting,
  categoryColor,
  isFocused,
  onCategoryAssign,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsMobileCardProps) {
  const isBusy = isUpdating || isDeleting;

  return (
    <article
      ref={(node) => {
        if (node) rowRefs.current.set(transaction.id, node);
        else rowRefs.current.delete(transaction.id);
      }}
      className={`flex flex-col gap-3 rounded-[22px] border p-4 transition-colors motion-reduce:transition-none ${
        isFocused ? 'bg-(--accent)/15' : ''
      }`}
      style={{
        background: isFocused ? undefined : 'rgba(255,253,247,0.55)',
        borderColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: '0 6px 22px -10px rgba(45,36,24,0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] tracking-wide" style={{ color: 'var(--ink-3)' }}>
            {formatShortDate(transaction.date)}
          </div>
          <h3
            className="m-0 mt-1 text-[18px] font-normal leading-tight tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
          >
            {prettyName(transaction.merchant ?? transaction.description)}
          </h3>
        </div>
        <div
          className="shrink-0 text-right text-[19px] font-medium tabular-nums"
          style={{
            fontFamily: "'Fraunces', serif",
            color: transaction.type === 'credit' ? '#3d6b1f' : 'var(--ink)',
            fontFeatureSettings: "'lnum', 'tnum'",
          }}
          aria-label={`${transaction.type === 'credit' ? 'Credit' : 'Debit'} ${formatAmount(transaction.amount)}`}
        >
          {transaction.type === 'credit' ? '+' : ''}
          {formatAmount(transaction.amount)}
        </div>
      </div>

      {transaction.merchant && transaction.description && transaction.description !== transaction.merchant ? (
        <p
          className="m-0 line-clamp-2 text-[12px] leading-snug"
          style={{ color: 'var(--ink-3)' }}
          title={transaction.description}
        >
          {transaction.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <CategorySelect
          transaction={transaction}
          categoryColor={categoryColor}
          rowCategoryOptions={rowCategoryOptions}
          disabled={isBusy}
          onCategoryAssign={onCategoryAssign}
          mobile
        />
        <TransactionStatusPill status={transaction.status} mobile />
      </div>

      <div
        className="-mx-1 flex items-center justify-end gap-1 border-t border-dashed pt-2"
        style={{ borderColor: 'rgba(45,36,24,0.1)' }}
      >
        <button
          type="button"
          onClick={() => onEditTransaction(transaction)}
          disabled={isBusy}
          aria-label="Edit transaction"
          className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-white/60 disabled:opacity-50"
          style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', touchAction: 'manipulation' }}
        >
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.3} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDeleteTransaction(transaction)}
          disabled={isBusy}
          aria-label="Delete transaction"
          className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-[rgba(248,215,192,0.7)] disabled:opacity-50"
          style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--accent)', touchAction: 'manipulation' }}
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
          Delete
        </button>
      </div>
    </article>
  );
});
