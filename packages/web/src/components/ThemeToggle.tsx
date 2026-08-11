import { useTheme } from '@/hooks/useTheme';

/**
 * Compact theme picker for pages without an account menu. Shows the same colour
 * swatches as ThemeSwitcher, but as a segmented pill rather than a labelled list.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className={`inline-flex items-center gap-1 rounded-full border border-ink/15 bg-frost/50 p-1 shadow-[inset_0_1px_0_rgba(var(--frost-rgb),0.6)] backdrop-blur-md ${className}`}
    >
      {themes.map((option) => {
        const active = option.id === theme;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            aria-pressed={active}
            aria-label={`${option.name} theme`}
            title={`${option.name} — ${option.hint}`}
            className={[
              'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 transition-[background-color,opacity,transform] duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
              active
                ? 'bg-ink/10 opacity-100'
                : 'bg-transparent opacity-55 hover:opacity-100 motion-safe:hover:scale-105',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className={[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-shadow duration-200',
                active
                  ? 'shadow-[inset_0_0_0_1px_rgba(var(--frost-rgb),0.5),0_0_0_1.5px_var(--accent)]'
                  : 'shadow-[inset_0_0_0_1px_rgba(var(--frost-rgb),0.5)]',
              ].join(' ')}
              style={{ background: option.swatch[0] }}
            >
              <span className="flex h-2.5 w-2.5 overflow-hidden rounded-full">
                <span className="h-full w-1/2" style={{ background: option.swatch[1] }} />
                <span className="h-full w-1/2" style={{ background: option.swatch[2] }} />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
