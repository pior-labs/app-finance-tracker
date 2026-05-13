import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type DashboardTheme = 'warm-sketch' | 'bloom' | 'glass' | 'swiss';

export const DASHBOARD_THEMES: { id: DashboardTheme; label: string; swatch: string }[] = [
  { id: 'warm-sketch', label: 'Warm Sketch', swatch: '#f3d9cf' },
  { id: 'bloom', label: 'Bloom', swatch: '#cae0a8' },
  { id: 'glass', label: 'Glass', swatch: '#6c5ce7' },
  { id: 'swiss', label: 'Swiss', swatch: '#1a7a4a' },
];

const STORAGE_KEY = 'finlens.dashboardTheme';
const DEFAULT_THEME: DashboardTheme = 'warm-sketch';

function isDashboardTheme(value: unknown): value is DashboardTheme {
  return (
    value === 'warm-sketch' || value === 'bloom' || value === 'glass' || value === 'swiss'
  );
}

function readInitial(): DashboardTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isDashboardTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

interface DashboardThemeContextValue {
  theme: DashboardTheme;
  setTheme: (next: DashboardTheme) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<DashboardTheme>(readInitial);

  const setTheme = useCallback((next: DashboardTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota / disabled storage
    }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isDashboardTheme(e.newValue)) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme(): DashboardThemeContextValue {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) {
    throw new Error('useDashboardTheme must be used inside <DashboardThemeProvider>');
  }
  return ctx;
}
