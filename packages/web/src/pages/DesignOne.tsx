import { DesignSwitcher } from '@/components/DesignSwitcher';

const serif = "'Fraunces', 'Times New Roman', serif";
const body = "'Newsreader', Georgia, serif";

const categories = [
  { name: 'Groceries', amount: 842.17, share: 22, note: 'Whole Foods, Trader Joe’s' },
  { name: 'Travel', amount: 620.4, share: 16, note: 'Weekend in Portland' },
  { name: 'Dining Out', amount: 521.88, share: 13, note: '24 visits · avg $21.74' },
  { name: 'Shopping', amount: 412.0, share: 10, note: 'Spring wardrobe' },
  { name: 'Transport', amount: 287.33, share: 7, note: 'Lyft & Caltrain' },
  { name: 'Utilities', amount: 245.12, share: 6, note: 'PG&E, Comcast' },
  { name: 'Health', amount: 184.5, share: 5, note: 'Pharmacy & yoga' },
  { name: 'Subscriptions', amount: 178.49, share: 4, note: '12 recurring' }
];

const recent = [
  { d: 'Mar 28', desc: 'Bi-Rite Market', cat: 'Groceries', amt: -42.18, conf: 0.98 },
  { d: 'Mar 27', desc: 'Alaska Air ANC→SFO', cat: 'Travel', amt: -318.4, conf: 0.95 },
  { d: 'Mar 26', desc: 'Tartine Bakery', cat: 'Dining Out', amt: -23.5, conf: 0.93 },
  { d: 'Mar 25', desc: 'SFMTA Clipper Autoload', cat: 'Transport', amt: -60.0, conf: 0.99 },
  { d: 'Mar 24', desc: 'Employer · Direct Deposit', cat: 'Income', amt: 4280.0, conf: 1.0 },
  { d: 'Mar 23', desc: 'Blue Bottle 3rd St', cat: 'Dining Out', amt: -6.75, conf: 0.96 }
];

export function DesignOne() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#f4ecd8',
        color: '#1a1410',
        fontFamily: body,
        fontFeatureSettings: "'onum', 'pnum'"
      }}
    >
      <DesignSwitcher tone="light" />

      {/* Masthead */}
      <header
        className="border-y-4 border-double px-10 py-6 md:px-16"
        style={{ borderColor: '#1a1410' }}
      >
        <div className="flex items-baseline justify-between gap-6 flex-wrap">
          <div className="text-[11px] tracking-[0.3em] uppercase">Vol. I · No. 3</div>
          <div
            className="text-center text-5xl md:text-7xl font-black italic leading-none"
            style={{ fontFamily: serif, letterSpacing: '-0.02em' }}
          >
            The Household Ledger
          </div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-right">
            Sunday · March 29 · 2026
          </div>
        </div>
        <div
          className="mt-4 flex items-center justify-between text-[12px] tracking-[0.2em] uppercase"
          style={{ color: '#5a4d3a' }}
        >
          <span>Est. 2026 — A private broadsheet for two</span>
          <span>Weather: fair · Coffee: black · Saved: 6.8%</span>
        </div>
      </header>

      {/* Top story */}
      <section className="px-10 md:px-16 py-10 grid grid-cols-12 gap-10">
        <div className="col-span-12 md:col-span-7 md:border-r md:pr-10" style={{ borderColor: '#c9bfa7' }}>
          <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: '#8a7a5c' }}>
            Lead Story · Month in Review
          </div>
          <h1
            className="text-6xl md:text-[88px] font-black leading-[0.92] mb-6"
            style={{ fontFamily: serif, letterSpacing: '-0.03em' }}
          >
            A quieter month, <span className="italic font-normal">by just enough.</span>
          </h1>
          <p className="text-lg leading-relaxed mb-4 first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8]"
             style={{ fontFamily: serif }}>
            March drew to a close with household outlays of{' '}
            <strong>$3,847.52</strong> — a welcome 6.8% decline from February’s
            rather indulgent total. The savings, though modest, were won honestly:
            fewer restaurant evenings, a single trip rather than two, and a
            newfound reverence for the home kitchen.
          </p>
          <p className="text-lg leading-relaxed" style={{ fontFamily: serif }}>
            Groceries remained the faithful anchor at $842.17, while a weekend in
            Portland represented the month’s principal luxury. Subscriptions, as
            ever, continue their quiet creep and merit a closer look next issue.
          </p>

          <div className="mt-8 flex gap-3 text-[12px] tracking-[0.2em] uppercase">
            <button
              className="px-4 py-2 border-2 transition hover:bg-[#1a1410] hover:text-[#f4ecd8]"
              style={{ borderColor: '#1a1410' }}
            >
              Upload Statement
            </button>
            <button
              className="px-4 py-2 border-2 transition hover:bg-[#1a1410] hover:text-[#f4ecd8]"
              style={{ borderColor: '#1a1410' }}
            >
              Review 7 items
            </button>
          </div>
        </div>

        {/* By the numbers */}
        <aside className="col-span-12 md:col-span-5">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: '#8a7a5c' }}>
            By the Numbers
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-70">Total spent</div>
              <div
                className="text-5xl font-black"
                style={{ fontFamily: serif, letterSpacing: '-0.02em' }}
              >
                $3,847<span className="text-2xl align-top">.52</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-70">vs. February</div>
              <div className="text-5xl font-black italic" style={{ fontFamily: serif }}>
                −6.8%
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-70">Transactions</div>
              <div className="text-5xl font-black" style={{ fontFamily: serif }}>
                148
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-70">Auto-categorized</div>
              <div className="text-5xl font-black" style={{ fontFamily: serif }}>
                141<span className="text-xl align-top opacity-60">/148</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-5" style={{ borderColor: '#c9bfa7' }}>
            <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: '#8a7a5c' }}>
              Advertisement — from the editors
            </div>
            <div
              className="border-2 border-dashed p-5 text-center italic"
              style={{ borderColor: '#8a7a5c', fontFamily: serif }}
            >
              <div className="text-2xl mb-1">“Tend to the subscriptions.”</div>
              <div className="text-xs tracking-[0.2em] uppercase mt-2 not-italic">
                $178.49 this month · 12 recurring
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Category table */}
      <section className="px-10 md:px-16 pb-12">
        <div className="border-t-2 border-b-2 py-2 flex items-center justify-between mb-5" style={{ borderColor: '#1a1410' }}>
          <div className="text-[11px] tracking-[0.3em] uppercase">Section B · Expenditure by Category</div>
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60">Page 2</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          {categories.map((c) => (
            <div
              key={c.name}
              className="flex items-baseline border-b border-dotted pb-2"
              style={{ borderColor: '#8a7a5c' }}
            >
              <div className="flex-1">
                <div className="text-xl font-semibold" style={{ fontFamily: serif }}>
                  {c.name}
                </div>
                <div className="text-xs italic opacity-70">{c.note}</div>
              </div>
              <div
                className="flex-1 mx-3 overflow-hidden text-xs tracking-[0.3em] opacity-50 whitespace-nowrap"
                aria-hidden
              >
                {'· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·'}
              </div>
              <div
                className="text-2xl tabular-nums font-semibold"
                style={{ fontFamily: serif }}
              >
                ${c.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="px-10 md:px-16 pb-16">
        <div className="border-t-2 border-b-2 py-2 flex items-center justify-between mb-5" style={{ borderColor: '#1a1410' }}>
          <div className="text-[11px] tracking-[0.3em] uppercase">Section C · Recent Entries</div>
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60">Page 3</div>
        </div>
        <table className="w-full text-[15px]" style={{ fontFamily: serif }}>
          <thead>
            <tr className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#8a7a5c' }}>
              <th className="text-left font-normal py-2 border-b" style={{ borderColor: '#1a1410' }}>Date</th>
              <th className="text-left font-normal py-2 border-b" style={{ borderColor: '#1a1410' }}>Description</th>
              <th className="text-left font-normal py-2 border-b" style={{ borderColor: '#1a1410' }}>Category</th>
              <th className="text-right font-normal py-2 border-b" style={{ borderColor: '#1a1410' }}>Confidence</th>
              <th className="text-right font-normal py-2 border-b" style={{ borderColor: '#1a1410' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t, i) => (
              <tr key={i} className="border-b" style={{ borderColor: '#c9bfa7' }}>
                <td className="py-3 tabular-nums italic opacity-70">{t.d}</td>
                <td className="py-3 font-semibold">{t.desc}</td>
                <td className="py-3 italic">{t.cat}</td>
                <td className="py-3 text-right tabular-nums opacity-70">
                  {(t.conf * 100).toFixed(0)}%
                </td>
                <td
                  className="py-3 text-right tabular-nums font-semibold"
                  style={{ color: t.amt > 0 ? '#3b5a1e' : '#1a1410' }}
                >
                  {t.amt > 0 ? '+' : '−'}${Math.abs(t.amt).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 text-center text-[11px] tracking-[0.3em] uppercase opacity-60">
          — Continued in next issue · Printed privately for two subscribers —
        </div>
      </section>
    </div>
  );
}
