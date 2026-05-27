import { useCallback, useState } from 'react';
import { StatementUploadModal } from '@/features/statements/components/StatementUploadModal';
import { StatementsDesktopTable } from './components/StatementsDesktopTable';
import { StatementsErrorBanner } from './components/StatementsErrorBanner';
import { StatementsHeader } from './components/StatementsHeader';
import { StatementsMobileList } from './components/StatementsMobileList';
import { StatementsWarningFooter } from './components/StatementsWarningFooter';
import { useStatementsData } from './hooks/useStatementsData';

export function StatementsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const {
    statements,
    sortedStatements,
    totalTransactions,
    loading,
    error,
    viewingStatementIds,
    reparsingStatementIds,
    deletingStatementIds,
    pendingStatementIds,
    refresh,
    viewStatementTransactions,
    reparseStatement,
    deleteStatement,
  } = useStatementsData();

  const openUpload = useCallback(() => {
    setUploadOpen(true);
  }, []);

  const closeUpload = useCallback(() => {
    setUploadOpen(false);
  }, []);

  const onRetry = useCallback(() => {
    void refresh();
  }, [refresh]);

  const onUploadComplete = useCallback(() => {
    void refresh();
  }, [refresh]);

  const onViewStatementTransactions = useCallback((statementId: number) => {
    void viewStatementTransactions(statementId);
  }, [viewStatementTransactions]);

  const onReparseStatement = useCallback((statementId: number) => {
    void reparseStatement(statementId);
  }, [reparseStatement]);

  const onDeleteStatement = useCallback((statementId: number) => {
    void deleteStatement(statementId);
  }, [deleteStatement]);

  return (
    <div className="flex flex-col gap-5">
      <StatementsHeader
        statementCount={statements.length}
        totalTransactions={totalTransactions}
        onUpload={openUpload}
      />

      {error ? <StatementsErrorBanner error={error} loading={loading} onRetry={onRetry} /> : null}

      <StatementsDesktopTable
        statements={sortedStatements}
        loading={loading}
        viewingStatementIds={viewingStatementIds}
        reparsingStatementIds={reparsingStatementIds}
        deletingStatementIds={deletingStatementIds}
        pendingStatementIds={pendingStatementIds}
        onUpload={openUpload}
        onViewStatementTransactions={onViewStatementTransactions}
        onReparseStatement={onReparseStatement}
        onDeleteStatement={onDeleteStatement}
      />

      <StatementsMobileList
        statements={sortedStatements}
        loading={loading}
        viewingStatementIds={viewingStatementIds}
        reparsingStatementIds={reparsingStatementIds}
        deletingStatementIds={deletingStatementIds}
        pendingStatementIds={pendingStatementIds}
        onUpload={openUpload}
        onViewStatementTransactions={onViewStatementTransactions}
        onReparseStatement={onReparseStatement}
        onDeleteStatement={onDeleteStatement}
      />

      <StatementsWarningFooter />

      <StatementUploadModal
        open={uploadOpen}
        onClose={closeUpload}
        onUploadComplete={onUploadComplete}
      />
    </div>
  );
}
