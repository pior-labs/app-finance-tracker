import { NavLink } from 'react-router-dom';

const designs = [
  { to: '/1', label: '01' },
  { to: '/2', label: '02' },
  { to: '/3', label: '03' },
  { to: '/4', label: '04' },
  { to: '/5', label: '05' }
] as const;

type Tone = 'light' | 'dark';

export function DesignSwitcher({ tone = 'light' }: { tone?: Tone }) {
  const base =
    tone === 'dark'
      ? 'bg-black/70 text-white/90 border-white/20 backdrop-blur-md'
      : 'bg-white/80 text-black/80 border-black/10 backdrop-blur-md';
  const active =
    tone === 'dark'
      ? 'bg-white text-black'
      : 'bg-black text-white';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full border px-1.5 py-1 text-[11px] font-medium tracking-widest shadow-lg ${base}`}
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      <span className="px-2 opacity-60">DESIGN</span>
      {designs.map((d) => (
        <NavLink
          key={d.to}
          to={d.to}
          className={({ isActive }) =>
            `flex size-7 items-center justify-center rounded-full transition ${
              isActive
                ? active
                : tone === 'dark'
                ? 'hover:bg-white/10'
                : 'hover:bg-black/5'
            }`
          }
        >
          {d.label}
        </NavLink>
      ))}
    </div>
  );
}
