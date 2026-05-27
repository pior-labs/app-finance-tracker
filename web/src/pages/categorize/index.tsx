import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCategorizeQueue } from './hooks/useCategorizeQueue';
import { CategorizeCompleteState } from './components/CategorizeCompleteState';
import { CategorizeErrorState } from './components/CategorizeErrorState';
import { CategorizeHeader } from './components/CategorizeHeader';
import { CategorizeLoadingState } from './components/CategorizeLoadingState';
import { QueuePreviewGrid } from './components/QueuePreviewGrid';
import { TransactionHeroCard } from './components/TransactionHeroCard';

export function CategorizePage() {
  const {
    categories,
    queue,
    current,
    upNext,
    totalUncategorized,
    confirmedList,
    undoStack,
    loading,
    error,
    isLocked,
    assignCategory,
    skip,
    goBack,
    undo,
    refresh,
  } = useCategorizeQueue();

  const confirmedCount = confirmedList.length;
  const remaining = Math.max(0, totalUncategorized - confirmedCount);
  const positionInBatch = confirmedCount + 1;
  const batchTotal = remaining + confirmedCount;
  const progressPct = totalUncategorized > 0
    ? Math.round((confirmedCount / totalUncategorized) * 100)
    : 0;

  const favoriteCategories = useMemo(() => {
    return [...categories]
      .filter((category) => category.isFavorite)
      .sort((a, b) => {
        const aAt = a.favoritedAt ? new Date(a.favoritedAt).getTime() : 0;
        const bAt = b.favoritedAt ? new Date(b.favoritedAt).getTime() : 0;
        return aAt - bAt;
      })
      .slice(0, 10);
  }, [categories]);

  const onAssignCategory = useCallback((categoryId: number) => {
    void assignCategory(categoryId);
  }, [assignCategory]);

  const onUndo = useCallback(() => {
    void undo();
  }, [undo]);

  const keyboardStateRef = useRef({
    assignCategory,
    current,
    favoriteCategories,
    goBack,
    skip,
    undo,
    undoCount: undoStack.length,
  });

  useEffect(() => {
    keyboardStateRef.current = {
      assignCategory,
      current,
      favoriteCategories,
      goBack,
      skip,
      undo,
      undoCount: undoStack.length,
    };
  }, [assignCategory, current, favoriteCategories, goBack, skip, undo, undoStack.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const {
        assignCategory: assignLatestCategory,
        current: latestCurrent,
        favoriteCategories: latestFavoriteCategories,
        goBack: goBackLatest,
        skip: skipLatest,
        undo: undoLatest,
        undoCount,
      } = keyboardStateRef.current;

      const keyToIndex = e.key === '0' ? 9 : parseInt(e.key, 10) - 1;
      if (keyToIndex >= 0 && keyToIndex < latestFavoriteCategories.length && latestCurrent) {
        void assignLatestCategory(latestFavoriteCategories[keyToIndex].id);
        return;
      }

      if (e.key === 'ArrowLeft' && latestCurrent) goBackLatest();
      if (e.key === 'ArrowRight' && latestCurrent) skipLatest();
      if ((e.key === 'u' || e.key === 'U') && undoCount > 0) void undoLatest();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return <CategorizeLoadingState />;
  }

  if (error) {
    return <CategorizeErrorState error={error} onRetry={() => void refresh()} />;
  }

  if (remaining === 0 && queue.length === 0) {
    return <CategorizeCompleteState />;
  }

  return (
    <>
      <CategorizeHeader
        remaining={remaining}
        confirmedCount={confirmedCount}
        totalUncategorized={totalUncategorized}
        progressPct={progressPct}
      />

      {current ? (
        <TransactionHeroCard
          current={current}
          categories={categories}
          favoriteCategories={favoriteCategories}
          isLocked={isLocked}
          positionInBatch={positionInBatch}
          batchTotal={batchTotal}
          onAssign={onAssignCategory}
          onBack={goBack}
          onSkip={skip}
        />
      ) : null}

      <QueuePreviewGrid
        upNext={upNext}
        confirmedList={confirmedList}
        undoStack={undoStack}
        isLocked={isLocked}
        onUndo={onUndo}
      />
    </>
  );
}
