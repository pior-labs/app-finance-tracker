import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface UncategorizedCountCtx {
  count: number;
  adjust: (delta: number) => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<UncategorizedCountCtx | null>(null);

export function UncategorizedCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions?status=needs_review&limit=1', {
        credentials: 'include',
      });
      if (!res.ok) return;
      const payload = (await res.json()) as { pagination?: { total?: number } };
      setCount(Number(payload.pagination?.total ?? 0));
    } catch {
      // ignore — badge will keep its last known value
    }
  }, []);

  const adjust = useCallback((delta: number) => {
    if (!delta) return;
    setCount((c) => Math.max(0, c + delta));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ count, adjust, refresh }), [count, adjust, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const NOOP_CTX: UncategorizedCountCtx = {
  count: 0,
  adjust: () => {},
  refresh: async () => {},
};

export function useUncategorizedCount(): UncategorizedCountCtx {
  return useContext(Ctx) ?? NOOP_CTX;
}
