import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeId = 'bloom' | 'slate';

export interface ThemeOption {
  id: ThemeId;
  /** Display name shown in the switcher. */
  name: string;
  /** One-line flavour text. */
  hint: string;
  /** Swatch colors [backdrop, surface, accent] for the switcher preview. */
  swatch: [string, string, string];
}

/**
 * The single source of truth for selectable themes. Each one is defined purely
 * in `app.css` via a `[data-theme="…"]` block — adding a theme is one entry
 * here plus one CSS block. Nothing else in the app needs to change.
 */
export const THEMES: ThemeOption[] = [
  { id: 'bloom', name: 'Bloom', hint: 'Warm light', swatch: ['#fdf9f0', '#f8d7c0', '#c5704a'] },
  { id: 'slate', name: 'Slate', hint: 'Cool neutral', swatch: ['#eef1f6', '#ffffff', '#3b6ea5'] }
];

const STORAGE_KEY = 'finlens-theme';
const DEFAULT_THEME: ThemeId = 'bloom';

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((theme) => theme.id === value);
}

/** Reads the persisted theme; falls back to the default. Safe to call pre-render. */
export function readStoredTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    /* localStorage unavailable (private mode, SSR) — use default */
  }
  return DEFAULT_THEME;
}

function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => readStoredTheme());

  // Keep <html data-theme> and storage in sync with state.
  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore persistence failures */
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => setThemeState(next), []);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
