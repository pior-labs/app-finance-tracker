import { memo } from 'react';

interface StatementFileCellProps {
  filename: string;
  mobile?: boolean;
}

export const StatementFileCell = memo(function StatementFileCell({ filename, mobile = false }: StatementFileCellProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden={mobile ? 'true' : undefined}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[8px] font-bold uppercase"
        style={{
          background: 'var(--finlens-mixed-pastel-bg)',
          color: 'var(--ink-3)',
          border: '1px solid rgba(var(--frost-rgb),0.6)',
        }}
      >
        PDF
      </span>
      <span
        className={mobile ? 'min-w-0 flex-1 truncate text-[12px]' : 'max-w-[140px] truncate text-xs'}
        style={{ color: 'var(--ink-3)' }}
        title={filename}
      >
        {filename}
      </span>
    </div>
  );
});
