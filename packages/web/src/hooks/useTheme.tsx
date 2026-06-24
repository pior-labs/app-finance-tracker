import { ThemeProvider as BaseThemeProvider } from '@ipior/custom-tailwind-shadcn-themes';

export {
  DEFAULT_THEME,
  THEMES,
  readStoredTheme,
  useTheme,
  type ThemeId,
  type ThemeOption
} from '@ipior/custom-tailwind-shadcn-themes';

const STORAGE_KEY = 'finlens-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <BaseThemeProvider storageKey={STORAGE_KEY}>{children}</BaseThemeProvider>;
}
