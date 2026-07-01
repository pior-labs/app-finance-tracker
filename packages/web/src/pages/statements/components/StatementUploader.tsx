import { memo } from 'react';
import type { StatementListItem } from '../types';
import { getStatementUserInitial, getStatementUserLabel } from '../lib/format';

interface StatementUploaderProps {
  statement: StatementListItem;
  mobile?: boolean;
}

export const StatementUploader = memo(function StatementUploader({ statement, mobile = false }: StatementUploaderProps) {
  return (
    <div className={mobile ? 'flex min-w-0 items-center gap-2' : 'flex items-center gap-2'}>
      <span
        aria-hidden={mobile ? 'true' : undefined}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
        style={{
          fontFamily: "'Fraunces', serif",
          background: 'var(--finlens-avatar-bg)',
          color: 'var(--ink)',
          boxShadow: 'inset 0 0 0 1px rgba(var(--frost-rgb),0.5)',
        }}
      >
        {getStatementUserInitial(statement)}
      </span>
      <span className={mobile ? 'truncate text-[13px]' : 'text-[13px]'} style={{ color: mobile ? 'var(--ink-2)' : 'var(--ink)' }}>
        {getStatementUserLabel(statement)}
      </span>
    </div>
  );
});
