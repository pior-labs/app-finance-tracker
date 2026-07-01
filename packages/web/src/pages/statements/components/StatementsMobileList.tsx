import { memo } from 'react';
import { Eye, RefreshCw, Trash2 } from 'lucide-react';
import { STATEMENT_SKELETON_ROWS } from '../lib/constants';
import { formatDate, formatPeriod, getStatementStatus, getTransactionUnit } from '../lib/format';
import type { StatementListItem } from '../types';
import { StatementFileCell } from './StatementFileCell';
import { StatementStatusPill } from './StatementStatusPill';
import { StatementUploader } from './StatementUploader';
import { StatementsEmptyState } from './StatementsEmptyState';

interface StatementsMobileListProps {
  statements: StatementListItem[];
  loading: boolean;
  viewingStatementIds: Set<number>;
  reparsingStatementIds: Set<number>;
  deletingStatementIds: Set<number>;
  pendingStatementIds: Set<number>;
  onUpload: () => void;
  onViewStatementTransactions: (statementId: number) => void;
  onReparseStatement: (statementId: number) => void;
  onDeleteStatement: (statementId: number) => void;
}

export const StatementsMobileList = memo(function StatementsMobileList({
  statements,
  loading,
  viewingStatementIds,
  reparsingStatementIds,
  deletingStatementIds,
  pendingStatementIds,
  onUpload,
  onViewStatementTransactions,
  onReparseStatement,
  onDeleteStatement,
}: StatementsMobileListProps) {
  return (
    <div className="flex flex-col gap-2.5 md:hidden" aria-busy={loading}>
      {loading ? (
        <>
          <span role="status" aria-live="polite" className="sr-only">
            Loading statements...
          </span>
          {STATEMENT_SKELETON_ROWS.map((row) => (
            <div
              key={row}
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
                  width: `${55 + (row % 3) * 14}%`,
                  animationDelay: `${row * 0.1}s`,
                }}
              />
              <div
                className="mt-2.5 h-3 w-2/3 animate-pulse rounded-full motion-reduce:animate-none"
                style={{ background: 'rgba(45,36,24,0.05)', animationDelay: `${row * 0.1 + 0.05}s` }}
              />
            </div>
          ))}
        </>
      ) : statements.length === 0 ? (
        <StatementsEmptyState variant="mobile" onUpload={onUpload} />
      ) : (
        statements.map((statement) => {
          const status = getStatementStatus(statement);
          const isViewing = viewingStatementIds.has(statement.id);
          const isReparsing = reparsingStatementIds.has(statement.id);
          const isDeleting = deletingStatementIds.has(statement.id);
          const isRowPending = pendingStatementIds.has(statement.id);

          return (
            <article
              key={statement.id}
              className="flex flex-col gap-3 rounded-[22px] border p-4"
              style={{
                background: status === 'failed' ? 'var(--finlens-danger-surface)' : 'rgba(var(--surface-rgb),0.55)',
                borderColor: 'rgba(var(--frost-rgb),0.8)',
                backdropFilter: 'blur(20px) saturate(140%)',
                WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                boxShadow: '0 6px 22px -10px rgba(45,36,24,0.08)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] tracking-wide" style={{ color: 'var(--ink-3)' }}>
                    {formatDate(statement.createdAt)}
                  </div>
                  <h3
                    className="m-0 mt-1 text-[17px] font-medium leading-snug"
                    style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
                  >
                    {formatPeriod(statement.periodStart, statement.periodEnd)}
                  </h3>
                </div>
                <StatementStatusPill status={status} className="shrink-0 py-1" />
              </div>

              <StatementFileCell filename={statement.originalFilename} mobile />

              <div className="flex items-center justify-between gap-3">
                <StatementUploader statement={statement} mobile />
                <div className="shrink-0 text-right">
                  <span
                    className="text-[15px] font-medium tabular-nums"
                    style={{ fontFamily: "'Fraunces', serif", color: statement.transactionCount > 0 ? 'var(--ink)' : 'var(--ink-3)' }}
                  >
                    {statement.transactionCount > 0 ? statement.transactionCount : '-'}
                  </span>
                  <span className="ml-1 text-[11px]" style={{ color: 'var(--ink-3)' }}>
                    {getTransactionUnit(statement.transactionCount)}
                  </span>
                </div>
              </div>

              <div
                className="-mx-1 flex items-center justify-end gap-1 border-t border-dashed pt-2"
                style={{ borderColor: 'rgba(45,36,24,0.1)' }}
              >
                <button
                  type="button"
                  onClick={() => onViewStatementTransactions(statement.id)}
                  aria-label="View transactions"
                  disabled={isRowPending}
                  className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-frost/60 disabled:cursor-not-allowed disabled:opacity-55"
                  style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
                >
                  <Eye aria-hidden="true" className={`h-4 w-4 ${isViewing ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => onReparseStatement(statement.id)}
                  aria-label="Re-parse statement"
                  disabled={isRowPending}
                  className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-base transition-colors hover:bg-frost/60 disabled:cursor-not-allowed disabled:opacity-55"
                  style={{ color: 'var(--ink-2)', touchAction: 'manipulation' }}
                >
                  <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isReparsing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteStatement(statement.id)}
                  aria-label="Delete statement"
                  disabled={isRowPending}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[13px] font-medium transition-colors hover:bg-[var(--finlens-danger-surface)] disabled:cursor-not-allowed disabled:opacity-55"
                  style={{ color: 'var(--finlens-danger-ink)', fontFamily: "'Outfit', sans-serif", touchAction: 'manipulation' }}
                >
                  <Trash2 aria-hidden="true" className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                  Delete
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
});
