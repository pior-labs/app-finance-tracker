import { useTheme } from '@/hooks/useTheme';

/**
 * Theme picker for the account menu. Renders a labelled list of themes with a
 * live color swatch and a check on the active one.
 */
export function ThemeSwitcher({ onSelect }: { onSelect?: () => void }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div role="group" aria-label="Theme">
      <div className="px-3 pb-1 pt-1.5 font-serif text-[11px] italic tracking-wide text-ink-2">Theme</div>
      <div className="flex flex-col gap-0.5">
        {themes.map((option) => {
          const active = option.id === theme;
          return (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => {
                setTheme(option.id);
                onSelect?.();
              }}
              className={[
                'flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-3 py-2 text-left font-[inherit] transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                active ? 'bg-ink/5' : 'hover:bg-ink/5'
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(var(--frost-rgb),0.5)]"
                style={{ background: option.swatch[0] }}
              >
                <span className="flex h-2.5 w-2.5 overflow-hidden rounded-full">
                  <span className="h-full w-1/2" style={{ background: option.swatch[1] }} />
                  <span className="h-full w-1/2" style={{ background: option.swatch[2] }} />
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[13px] text-ink">{option.name}</span>
                <span className="truncate text-[11px] text-ink-2">{option.hint}</span>
              </span>
              {active && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 text-accent">
                  <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
