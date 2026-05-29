import { Suspense, lazy, useCallback, useState } from 'react';
import { useUncategorizedCount } from '@/hooks/useUncategorizedCount';
import { StatementsDesktopTable } from './components/StatementsDesktopTable';
import { StatementsErrorBanner } from './components/StatementsErrorBanner';
import { StatementsHeader } from './components/StatementsHeader';
import { StatementsMobileList } from './components/StatementsMobileList';
import { StatementsWarningFooter } from './components/StatementsWarningFooter';
import { useStatementsData } from './hooks/useStatementsData';

const UploadModal = lazy(async () => {
  const module = await import('@/features/statements/components/StatementUploadModal');
  return { default: module.StatementUploadModal };
});

export function StatementsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { refresh: refreshUncategorizedCount } = useUncategorizedCount();
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
    void Promise.all([refresh(), refreshUncategorizedCount()]);
  }, [refresh, refreshUncategorizedCount]);

  const onViewStatementTransactions = useCallback((statementId: number) => {
    void viewStatementTransactions(statementId);
  }, [viewStatementTransactions]);

  const onReparseStatement = useCallback((statementId: number) => {
    void reparseStatement(statementId).then(refreshUncategorizedCount);
  }, [refreshUncategorizedCount, reparseStatement]);

  const onDeleteStatement = useCallback((statementId: number) => {
    void deleteStatement(statementId).then(refreshUncategorizedCount);
  }, [deleteStatement, refreshUncategorizedCount]);

  const renderUploadModal = uploadOpen ? (
    <Suspense fallback={null}>
      <UploadModal open={uploadOpen} onClose={closeUpload} onUploadComplete={onUploadComplete} />
    </Suspense>
  ) : null;

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

      {renderUploadModal}
    </div>
  );
}
