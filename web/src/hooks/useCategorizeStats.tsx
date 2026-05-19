import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CategorizeStats {
  done: number;
  left: number;
  position: number;
  total: number;
}

interface CategorizeStatsCtx {
  stats: CategorizeStats | null;
  setStats: (stats: CategorizeStats | null) => void;
}

const Ctx = createContext<CategorizeStatsCtx | null>(null);

export function CategorizeStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<CategorizeStats | null>(null);
  const value = useMemo(() => ({ stats, setStats }), [stats]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCategorizeStats(): CategorizeStats | null {
  const ctx = useContext(Ctx);
  return ctx?.stats ?? null;
}

export function usePublishCategorizeStats(stats: CategorizeStats | null) {
  const setStats = useContext(Ctx)?.setStats;
  useEffect(() => {
    if (!setStats) return;
    setStats(stats);
    return () => setStats(null);
  }, [setStats, stats?.done, stats?.left, stats?.position, stats?.total]);
}
