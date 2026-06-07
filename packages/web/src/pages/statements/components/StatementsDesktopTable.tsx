import { memo } from 'react';
import { Eye, RefreshCw, Trash2 } from 'lucide-react';
import { STATEMENT_SKELETON_ROWS } from '../lib/constants';
import { formatDate, formatPeriod, getStatementStatus } from '../lib/format';
import type { StatementListItem } from '../types';
import { StatementFileCell } from './StatementFileCell';
import { StatementStatusPill } from './StatementStatusPill';
import { StatementUploader } from './StatementUploader';
import { StatementsEmptyState } from './StatementsEmptyState';

interface StatementsDesktopTableProps {
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

export const StatementsDesktopTable = memo(function StatementsDesktopTable({
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
}: StatementsDesktopTableProps) {
  return (
    <div
      className="hidden overflow-hidden rounded-[28px] border md:block"
      aria-busy={loading}
      style={{
        background: 'rgba(255,253,247,0.55)',
        borderColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        boxShadow: '0 14px 44px -10px rgba(45,36,24,0.1), inset 0 0 0 1px rgba(255,255,255,0.45)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <thead>
            <tr
              className="border-b"
              style={{
                background: 'linear-gradient(135deg, rgba(220,211,240,0.2), rgba(248,215,192,0.25), rgba(202,224,168,0.15))',
                borderColor: 'rgba(45,36,24,0.08)',
              }}
            >
              <th className="h-11 px-5 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Period</th>
              <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>File</th>
              <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Uploaded by</th>
              <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Date</th>
              <th className="h-11 px-4 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Tx</th>
              <th className="h-11 px-4 text-left text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Status</th>
              <th className="h-11 px-5 text-right text-xs font-semibold tracking-wide" style={{ color: 'var(--ink-3)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <tr className="sr-only">
                  <td colSpan={7}>
                    <span role="status" aria-live="polite">
                      Loading statements...
                    </span>
                  </td>
                </tr>
                {STATEMENT_SKELETON_ROWS.map((row) => (
                  <tr key={row} className="border-b border-dashed" style={{ borderColor: 'rgba(45,36,24,0.08)' }}>
                    <td colSpan={7} className="px-5 py-4">
                      <div
                        className="h-4 animate-pulse rounded-full"
                        style={{
                          background: 'rgba(255,253,247,0.6)',
                          width: `${60 + (row % 3) * 15}%`,
                          animationDelay: `${row * 0.1}s`,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </>
            ) : statements.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20">
                  <StatementsEmptyState variant="desktop" onUpload={onUpload} />
                </td>
              </tr>
            ) : (
              statements.map((statement) => {
                const status = getStatementStatus(statement);
                const isViewing = viewingStatementIds.has(statement.id);
                const isReparsing = reparsingStatementIds.has(statement.id);
                const isDeleting = deletingStatementIds.has(statement.id);
                const isRowPending = pendingStatementIds.has(statement.id);

                return (
                  <tr
                    key={statement.id}
                    className="border-b border-dashed transition-colors hover:bg-white/40"
                    style={{
                      borderColor: 'rgba(45,36,24,0.08)',
                      background: status === 'failed' ? 'rgba(248,215,192,0.15)' : undefined,
                    }}
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="text-[15px] font-medium" style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}>
                        {formatPeriod(statement.periodStart, statement.periodEnd)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatementFileCell filename={statement.originalFilename} />
                    </td>
                    <td className="px-4 py-3">
                      <StatementUploader statement={statement} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                      {formatDate(statement.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span
                        className="text-[15px] font-medium"
                        style={{ fontFamily: "'Fraunces', serif", color: statement.transactionCount > 0 ? 'var(--ink)' : 'var(--ink-3)' }}
                      >
                        {statement.transactionCount > 0 ? statement.transactionCount : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatementStatusPill status={status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewStatementTransactions(statement.id)}
                          aria-label="View transactions"
                          disabled={isRowPending}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-55"
                          style={{ color: 'var(--ink-2)' }}
                          title="View transactions"
                        >
                          <Eye aria-hidden="true" className={`h-4 w-4 ${isViewing ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReparseStatement(statement.id)}
                          aria-label="Re-parse statement"
                          disabled={isRowPending}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-55"
                          style={{ color: 'var(--ink-2)' }}
                          title="Re-parse"
                        >
                          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isReparsing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteStatement(statement.id)}
                          aria-label="Delete statement"
                          disabled={isRowPending}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/40 transition-colors hover:bg-[rgba(248,215,192,0.7)] disabled:cursor-not-allowed disabled:opacity-55"
                          style={{ color: 'var(--accent)' }}
                          title="Delete"
                        >
                          <Trash2 aria-hidden="true" className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
