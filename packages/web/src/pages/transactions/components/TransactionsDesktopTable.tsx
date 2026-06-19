import { memo, useEffect, useState, type RefObject } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { formatAmount, formatShortDate, prettyName } from '../lib/format';
import type { SelectOption, TransactionListItem } from '../types';
import { TransactionStatusPill } from './TransactionStatusPill';

const DESKTOP_SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

interface TransactionsDesktopTableProps {
  tableViewportRef: RefObject<HTMLDivElement | null>;
  rowRefs: RefObject<Map<number, HTMLElement>>;
  categorySelectRefs: RefObject<Map<number, HTMLSelectElement>>;
  transactions: TransactionListItem[];
  loading: boolean;
  rowHeightPx: number | null;
  rowCategoryOptions: SelectOption[];
  updatingTransactionIds: Set<number>;
  deletingTransactionIds: Set<number>;
  categoryColorMap: Map<number, string>;
  focusedRowId: number | null;
  onCategoryAssign: (transaction: TransactionListItem, value: string) => void;
  onUpdateTransaction: (transaction: TransactionListItem, details: { merchant: string; description: string }) => Promise<boolean>;
  onDeleteTransaction: (transaction: TransactionListItem) => void;
}

export const TransactionsDesktopTable = memo(function TransactionsDesktopTable({
  tableViewportRef,
  rowRefs,
  categorySelectRefs,
  transactions,
  loading,
  rowHeightPx,
  rowCategoryOptions,
  updatingTransactionIds,
  deletingTransactionIds,
  categoryColorMap,
  focusedRowId,
  onCategoryAssign,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsDesktopTableProps) {
  return (
    <div
      ref={tableViewportRef}
      aria-busy={loading}
      className="hidden min-h-0 flex-1 overflow-hidden rounded-[28px] border md:block"
      style={{
        background: 'rgba(var(--surface-rgb),0.55)',
        borderColor: 'rgba(var(--frost-rgb),0.8)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        boxShadow: '0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(var(--frost-rgb),0.45)',
      }}
    >
      <div className="h-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <thead>
            <tr
              className="border-b"
              style={{
                background: 'linear-gradient(135deg, rgba(248,215,192,0.25), rgba(220,211,240,0.2), rgba(202,224,168,0.15))',
                borderColor: 'rgba(45,36,24,0.08)',
              }}
            >
              <th className="h-11 w-20 px-5 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Date</th>
              <th className="h-11 w-52 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Merchant</th>
              <th className="h-11 w-72 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Description</th>
              <th className="h-11 w-32 px-4 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Amount</th>
              <th className="h-11 w-64 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Category</th>
              <th className="h-11 w-40 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Status</th>
              <th className="h-11 w-36 px-5 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              DESKTOP_SKELETON_ROWS.map((index) => (
                <tr key={index} className="border-b border-dashed" style={{ borderColor: 'rgba(45,36,24,0.08)' }}>
                  <td colSpan={7} className="px-5 py-3" aria-hidden="true">
                    <div
                      className="h-4 animate-pulse rounded-full"
                      style={{
                        background: 'rgba(var(--surface-rgb),0.6)',
                        width: `${65 + (index % 3) * 12}%`,
                        animationDelay: `${index * 0.08}s`,
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <p className="text-base italic" style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink-3)' }}>
                    No transactions found.
                  </p>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <TransactionsTableRow
                  key={transaction.id}
                  transaction={transaction}
                  rowRefs={rowRefs}
                  categorySelectRefs={categorySelectRefs}
                  rowCategoryOptions={rowCategoryOptions}
                  isUpdating={updatingTransactionIds.has(transaction.id)}
                  isDeleting={deletingTransactionIds.has(transaction.id)}
                  categoryColor={transaction.categoryId ? categoryColorMap.get(transaction.categoryId) : undefined}
                  isFocused={focusedRowId === transaction.id}
                  rowHeightPx={rowHeightPx}
                  onCategoryAssign={onCategoryAssign}
                  onUpdateTransaction={onUpdateTransaction}
                  onDeleteTransaction={onDeleteTransaction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

interface TransactionsTableRowProps {
  transaction: TransactionListItem;
  rowRefs: RefObject<Map<number, HTMLElement>>;
  categorySelectRefs: RefObject<Map<number, HTMLSelectElement>>;
  rowCategoryOptions: SelectOption[];
  isUpdating: boolean;
  isDeleting: boolean;
  categoryColor?: string;
  isFocused: boolean;
  rowHeightPx: number | null;
  onCategoryAssign: (transaction: TransactionListItem, value: string) => void;
  onUpdateTransaction: (transaction: TransactionListItem, details: { merchant: string; description: string }) => Promise<boolean>;
  onDeleteTransaction: (transaction: TransactionListItem) => void;
}

const TransactionsTableRow = memo(function TransactionsTableRow({
  transaction,
  rowRefs,
  categorySelectRefs,
  rowCategoryOptions,
  isUpdating,
  isDeleting,
  categoryColor,
  isFocused,
  rowHeightPx,
  onCategoryAssign,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsTableRowProps) {
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
    <tr
      ref={(node) => {
        if (node) rowRefs.current.set(transaction.id, node);
        else rowRefs.current.delete(transaction.id);
      }}
      className={`border-b border-dashed transition-colors ${isFocused ? 'bg-(--accent)/15' : 'hover:bg-frost/40'}`}
      style={{
        borderColor: 'rgba(45,36,24,0.08)',
        ...(rowHeightPx ? { height: `${rowHeightPx}px` } : {}),
      }}
    >
      <td className="whitespace-nowrap px-5 py-1.5 text-[12px]" style={{ color: 'var(--ink-3)' }}>
        {formatShortDate(transaction.date)}
      </td>
      <td className="px-4 py-1.5">
        {isEditing ? (
          <input
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            disabled={isBusy}
            aria-label={`Merchant for transaction ${transaction.id}`}
            className="h-9 w-full rounded-xl border border-frost/70 bg-frost/60 px-3 text-[13px] outline-none focus:ring-2 focus:ring-(--accent)/30 disabled:opacity-50"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
          />
        ) : (
          <span className="text-[15px] font-medium" style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}>
            {prettyName(transaction.merchant ?? transaction.description)}
          </span>
        )}
      </td>
      <td className="px-4 py-1.5 text-[12px]" style={{ color: 'var(--ink-3)' }}>
        {isEditing ? (
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isBusy}
            required
            aria-label={`Description for transaction ${transaction.id}`}
            className="h-9 w-full rounded-xl border border-frost/70 bg-frost/60 px-3 text-[13px] outline-none focus:ring-2 focus:ring-(--accent)/30 disabled:opacity-50"
            style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--ink)' }}
          />
        ) : (
          transaction.description
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-1.5 text-right">
        <span
          className="text-[15px] font-medium"
          style={{
            fontFamily: "'Fraunces', serif",
            color: transaction.type === 'credit' ? '#3d6b1f' : 'var(--ink)',
          }}
        >
          {transaction.type === 'credit' ? '+' : ''}
          {formatAmount(transaction.amount)}
        </span>
      </td>
      <td className="px-4 py-1.5">
        <CategorySelect
          transaction={transaction}
          categoryColor={categoryColor}
          rowCategoryOptions={rowCategoryOptions}
          disabled={isBusy}
          categorySelectRefs={categorySelectRefs}
          onCategoryAssign={onCategoryAssign}
        />
      </td>
      <td className="whitespace-nowrap px-4 py-1.5">
        <TransactionStatusPill status={transaction.status} />
      </td>
      <td className="px-5 py-1.5">
        <div className="flex justify-end gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={isBusy || description.trim().length === 0}
                aria-label={`Save transaction ${transaction.id}`}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-frost/50 text-xs transition-colors hover:bg-frost/85 disabled:cursor-default disabled:opacity-50"
                style={{ color: '#3d6b1f' }}
                title="Save"
              >
                <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isBusy}
                aria-label={`Cancel editing transaction ${transaction.id}`}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-frost/40 text-xs transition-colors hover:bg-frost/80 disabled:cursor-default disabled:opacity-50"
                style={{ color: 'var(--ink-2)' }}
                title="Cancel"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteTransaction(transaction)}
                disabled={isBusy}
                aria-label={`Delete transaction ${transaction.id}`}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-frost/40 text-xs transition-colors hover:bg-[rgba(248,215,192,0.7)] disabled:cursor-default disabled:opacity-50"
                style={{ color: 'var(--accent)' }}
                title="Delete"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isBusy}
              aria-label={`Edit transaction ${transaction.id}`}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-0 bg-frost/40 text-xs transition-colors hover:bg-frost/80 disabled:cursor-default disabled:opacity-50"
              style={{ color: 'var(--ink-2)' }}
              title="Edit"
            >
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export function CategorySelect({
  transaction,
  categoryColor,
  rowCategoryOptions,
  disabled,
  categorySelectRefs,
  onCategoryAssign,
  mobile = false,
}: {
  transaction: TransactionListItem;
  categoryColor?: string;
  rowCategoryOptions: SelectOption[];
  disabled: boolean;
  categorySelectRefs?: RefObject<Map<number, HTMLSelectElement>>;
  onCategoryAssign: (transaction: TransactionListItem, value: string) => void;
  mobile?: boolean;
}) {
  return (
    <div className={`relative inline-flex items-center ${mobile ? 'min-w-0 flex-1' : ''}`}>
      {categoryColor ? (
        <span
          aria-hidden="true"
          className={`${mobile ? 'pointer-events-none absolute left-3' : 'absolute left-2.5'} h-2 w-2 rounded-full`}
          style={{ background: categoryColor, boxShadow: 'inset 0 0 0 1px rgba(var(--frost-rgb),0.5)' }}
        />
      ) : null}
      <select
        value={transaction.categoryId === null ? 'uncategorized' : String(transaction.categoryId)}
        disabled={disabled}
        ref={(node) => {
          if (!categorySelectRefs) return;
          if (node) categorySelectRefs.current.set(transaction.id, node);
          else categorySelectRefs.current.delete(transaction.id);
        }}
        onChange={(event) => onCategoryAssign(transaction, event.target.value)}
        aria-label={`Set category for transaction ${transaction.id}`}
        className={
          mobile
            ? 'h-11 w-full min-w-0 cursor-pointer appearance-none rounded-full border border-frost/70 bg-frost/50 pr-7 text-[13px] font-medium outline-none transition-colors hover:bg-frost/80 focus:ring-2 focus:ring-(--accent)/30 disabled:cursor-default disabled:opacity-50'
            : 'h-9 cursor-pointer appearance-none rounded-full border border-frost/70 bg-frost/50 pr-6 text-[13px] font-medium outline-none transition-colors hover:bg-frost/80 focus:ring-2 focus:ring-(--accent)/30 disabled:cursor-default disabled:opacity-50'
        }
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: transaction.categoryId === null ? 'var(--ink-3)' : 'var(--ink)',
          paddingLeft: categoryColor ? (mobile ? '1.5rem' : '1.25rem') : mobile ? '0.875rem' : '0.625rem',
          boxShadow: '0 2px 8px -2px rgba(45,36,24,0.06)',
          ...(mobile ? { touchAction: 'manipulation' } : {}),
        }}
      >
        {rowCategoryOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
