import { memo, useEffect, useState, type RefObject } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
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
  onUpdateTransaction: (transaction: TransactionListItem, details: { merchant: string; description: string }) => Promise<boolean>;
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
  onUpdateTransaction,
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
              background: 'rgba(var(--surface-rgb),0.55)',
              borderColor: 'rgba(var(--frost-rgb),0.8)',
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
            background: 'rgba(var(--surface-rgb),0.55)',
            borderColor: 'rgba(var(--frost-rgb),0.8)',
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
            onUpdateTransaction={onUpdateTransaction}
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
  onUpdateTransaction: (transaction: TransactionListItem, details: { merchant: string; description: string }) => Promise<boolean>;
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
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsMobileCardProps) {
  const isBusy = isUpdating || isDeleting;
  const [isEditing, setIsEditing] = useState(false);
  const [merchant, setMerchant] = useState(transaction.merchant ?? '');
  const [description, setDescription] = useState(transaction.description);

  useEffect(() => {
    if (isEditing) return;
    setMerchant(transaction.merchant ?? '');
    setDescription(transaction.description);
  }, [isEditing, transaction.description, transaction.merchant]);

  const cancelEdit = () => {
    setMerchant(transaction.merchant ?? '');
    setDescription(transaction.description);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const updated = await onUpdateTransaction(transaction, { merchant, description });
    if (updated) setIsEditing(false);
  };

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
        background: isFocused ? undefined : 'rgba(var(--surface-rgb),0.55)',
        borderColor: 'rgba(var(--frost-rgb),0.8)',
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

      {isEditing ? (
        <div className="grid gap-2.5 rounded-[18px] border border-frost/70 bg-frost/35 p-3">
          <label className="grid gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-3)' }}>
            Merchant
            <input
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              disabled={isBusy}
              className="h-11 rounded-full border border-frost/75 bg-frost/65 px-3.5 text-[14px] outline-none focus:ring-2 focus:ring-(--accent)/30 disabled:opacity-50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
            />
          </label>
          <label className="grid gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-3)' }}>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isBusy}
              required
              rows={3}
              className="min-h-22 resize-y rounded-[16px] border border-frost/75 bg-frost/65 px-3.5 py-2.5 text-[14px] leading-snug outline-none focus:ring-2 focus:ring-(--accent)/30 disabled:opacity-50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
            />
          </label>
        </div>
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
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => void saveEdit()}
              disabled={isBusy || description.trim().length === 0}
              aria-label="Save transaction"
              className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-frost/60 disabled:cursor-default disabled:opacity-50"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#3d6b1f', touchAction: 'manipulation' }}
            >
              <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isBusy}
              aria-label="Cancel editing transaction"
              className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-frost/60 disabled:cursor-default disabled:opacity-50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', touchAction: 'manipulation' }}
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.3} />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onDeleteTransaction(transaction)}
              disabled={isBusy}
              aria-label="Delete transaction"
              className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-[rgba(248,215,192,0.7)] disabled:cursor-default disabled:opacity-50"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--accent)', touchAction: 'manipulation' }}
            >
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
              Delete
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isBusy}
            aria-label="Edit transaction"
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-frost/60 disabled:cursor-default disabled:opacity-50"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink-2)', touchAction: 'manipulation' }}
          >
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.3} />
            Edit
          </button>
        )}
      </div>
    </article>
  );
});
