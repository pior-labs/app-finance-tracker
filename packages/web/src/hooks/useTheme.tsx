import { ThemeProvider as BaseThemeProvider } from '@pior-labs/design-system';

export {
  DEFAULT_THEME,
  THEMES,
  readStoredTheme,
  useTheme,
  type ThemeId,
  type ThemeOption
} from '@pior-labs/design-system';

const STORAGE_KEY = 'finlens-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <BaseThemeProvider storageKey={STORAGE_KEY}>{children}</BaseThemeProvider>;
}
