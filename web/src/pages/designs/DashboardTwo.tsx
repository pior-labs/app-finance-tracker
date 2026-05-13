import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { mock, money } from './mockData';

/**
 * GLASS — frosted glassmorphism. Translucent cards on a soft mesh gradient,
 * heavy blur, generous rounding. Purple accent (#6c5ce7).
 */
export function DashboardTwo() {
  return <BentoDash theme={GLASS_THEME} />;
}

export interface BentoTheme {
  name: string;
  font: string;
  displayFont?: string;
  fontImport: string | null;
  appBg: string;
  fg: string;
  muted: string;
  radius: number;
  sidebarBg: string;
  sidebarBorder: string;
  headerBorder: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  navFg: string;
  navIconBg: string;
  navIconFg: string;
  navActiveBg: string;
  navActiveFg: string;
  navActiveIconBg: string;
  navActiveIconFg: string;
  badgeBg: string;
  badgeFg: string;
  logoBg: string;
  logoFg: string;
  profileBg: string;
  av1: string;
  av1Fg: string;
  av2: string;
  av2Fg: string;
  primaryBg: string;
  primaryFg: string;
  chipBg: string;
  chipBorder: string;
  actionBg: string;
  actionFg: string;
  actionLabel: string;
  actionAccent: string;
  actionBorder: string;
  actionBtnBg: string;
  actionBtnFg: string;
  actionGhostBorder: string;
  actionRowBg: string;
  actionRowFg: string;
  actionRowMuted: string;
  actionRowBorder: string;
  thumbBg: string;
  thumbBorder: string;
  good: string;
  barTrack: string;
  barFill: string;
  numBg: string;
  numFg: string;
  linkFg: string;
}

export const GLASS_THEME: BentoTheme = {
  name: 'glass',
  font: '"Outfit", system-ui, sans-serif',
  fontImport:
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
  appBg: 'linear-gradient(135deg, #e8dff5 0%, #d1e8f0 40%, #f0e6d4 100%)',
  fg: '#1a1a2e',
  muted: '#6a6882',
  radius: 22,
  sidebarBg: 'rgba(255,255,255,.35)',
  sidebarBorder: '1px solid rgba(255,255,255,.5)',
  headerBorder: '1px solid rgba(255,255,255,.3)',
  cardBg: 'rgba(255,255,255,.55)',
  cardBorder: '1px solid rgba(255,255,255,.6)',
  cardShadow:
    '0 4px 24px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.6)',
  navFg: '#4a4868',
  navIconBg: 'rgba(255,255,255,.5)',
  navIconFg: '#4a4868',
  navActiveBg: 'rgba(255,255,255,.7)',
  navActiveFg: '#1a1a2e',
  navActiveIconBg: '#6c5ce7',
  navActiveIconFg: '#ffffff',
  badgeBg: '#fd79a8',
  badgeFg: '#ffffff',
  logoBg: '#6c5ce7',
  logoFg: '#ffffff',
  profileBg: 'rgba(255,255,255,.45)',
  av1: '#a29bfe',
  av1Fg: '#ffffff',
  av2: '#fab1a0',
  av2Fg: '#ffffff',
  primaryBg: '#6c5ce7',
  primaryFg: '#ffffff',
  chipBg: 'rgba(255,255,255,.5)',
  chipBorder: '1px solid rgba(255,255,255,.6)',
  actionBg: 'rgba(108,92,231,.12)',
  actionFg: '#1a1a2e',
  actionLabel: '#6c5ce7',
  actionAccent: '#6c5ce7',
  actionBorder: '1px solid rgba(108,92,231,.2)',
  actionBtnBg: '#6c5ce7',
  actionBtnFg: '#ffffff',
  actionGhostBorder: 'rgba(108,92,231,.25)',
  actionRowBg: 'rgba(255,255,255,.55)',
  actionRowFg: '#1a1a2e',
  actionRowMuted: '#8a88a2',
  actionRowBorder: '1px solid rgba(255,255,255,.5)',
  thumbBg: 'rgba(255,255,255,.35)',
  thumbBorder: '1px solid rgba(255,255,255,.5)',
  good: '#00b894',
  barTrack: 'rgba(255,255,255,.4)',
  barFill: '#6c5ce7',
  numBg: 'rgba(108,92,231,.1)',
  numFg: '#6c5ce7',
  linkFg: '#6c5ce7',
};

export interface BentoContentData {
  monthLabel: string;
  uncategorizedCount: number;
  totalSpentCents: number;
  totalTransactions: number;
  categorizedPct: number;
  recentUncategorized: {
    id: number | string;
    date: string;
    merchant: string;
    amount: number;
  }[];
  byCategory: { name: string; cents: number }[];
  topMerchants: { name: string; cents: number }[];
  statement?: {
    period: string;
    transactionCount: number;
    uploadedBy: string;
  } | null;
}

interface BentoContentProps {
  theme: BentoTheme;
  data: BentoContentData;
  categorizeHref?: string;
  onUploadNext?: () => void;
}

export function BentoContent({
  theme: t,
  data,
  categorizeHref = '/categorize',
  onUploadNext,
}: BentoContentProps) {
  const cats = data.byCategory.slice(0, 5);
  const maxCat = cats[0]?.cents ?? 1;
  const merchants = data.topMerchants.slice(0, 5);
  const monthShort = data.monthLabel.split(' ')[0];
  const recents = data.recentUncategorized.slice(0, 3);
  const moreCount = Math.max(0, data.uncategorizedCount - recents.length);

  const card = (extra: CSSProperties = {}): CSSProperties => ({
    background: t.cardBg,
    borderRadius: t.radius,
    border: t.cardBorder,
    boxShadow: t.cardShadow,
    padding: 24,
    ...extra,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: t.font,
        color: t.fg,
      }}
    >
      {t.fontImport && <link rel="stylesheet" href={t.fontImport} />}

      {/* Action card */}
      <section
        style={card({
          background: t.actionBg,
          color: t.actionFg,
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(260px, 360px)',
          gap: 24,
          border: t.actionBorder,
        })}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 8,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: t.actionLabel,
              textTransform: 'uppercase',
            }}
          >
            Action needed
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '-1.2px',
              lineHeight: 1,
              color: t.actionAccent,
              fontFamily: t.displayFont ?? t.font,
            }}
          >
            {data.uncategorizedCount} left
          </div>
          <div
            style={{
              fontSize: 15,
              color: t.actionFg,
              opacity: 0.85,
              marginTop: 4,
            }}
          >
            Categorize these to complete {monthShort}'s picture.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <Link
              to={categorizeHref}
              style={{
                background: t.actionBtnBg,
                color: t.actionBtnFg,
                border: 0,
                padding: '10px 18px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Categorize now →
            </Link>
            <button
              type="button"
              style={{
                background: 'transparent',
                color: t.actionFg,
                border: `1px solid ${t.actionGhostBorder}`,
                padding: '10px 18px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recents.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: t.actionRowBg,
                borderRadius: Math.max(8, t.radius / 1.5),
                border: t.actionRowBorder,
              }}
            >
              <span style={{ fontSize: 11, color: t.actionRowMuted, width: 46 }}>
                {r.date}
              </span>
              <span
                style={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: 13,
                  color: t.actionRowFg,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.merchant}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                  color: t.actionRowFg,
                }}
              >
                −{money(r.amount)}
              </span>
            </div>
          ))}
          {moreCount > 0 && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: t.actionRowMuted,
                marginTop: 2,
              }}
            >
              + {moreCount} more
            </div>
          )}
        </div>
      </section>

      {/* Stats row */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: 16,
        }}
      >
        <div style={card()}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: t.muted,
              textTransform: 'uppercase',
            }}
          >
            Spent in {monthShort}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-.8px',
              marginTop: 6,
              fontVariantNumeric: 'tabular-nums',
              fontFamily: t.displayFont ?? t.font,
            }}
          >
            {money(data.totalSpentCents, { showCents: false })}
            <span style={{ color: t.muted, fontSize: 24 }}>
              .{String(data.totalSpentCents % 100).padStart(2, '0')}
            </span>
          </div>
          <div style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>
            {data.totalTransactions} transactions
          </div>
        </div>
        <div style={card()}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: t.muted,
              textTransform: 'uppercase',
            }}
          >
            Categorized
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-.8px',
              marginTop: 6,
              fontVariantNumeric: 'tabular-nums',
              fontFamily: t.displayFont ?? t.font,
            }}
          >
            {data.categorizedPct}
            <span style={{ color: t.muted, fontSize: 24 }}>%</span>
          </div>
          <div
            style={{
              height: 6,
              background: t.barTrack,
              borderRadius: 999,
              marginTop: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${data.categorizedPct}%`,
                height: '100%',
                background: t.good,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
        <div style={card({ display: 'flex', alignItems: 'center', gap: 14 })}>
          <div
            style={{
              width: 42,
              height: 50,
              background: t.thumbBg,
              borderRadius: 6,
              border: t.thumbBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: t.muted,
              flexShrink: 0,
            }}
          >
            PDF
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {data.statement ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {data.statement.period}
                </div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
                  {data.statement.transactionCount} tx · uploaded by{' '}
                  {data.statement.uploadedBy}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: t.muted }}>No statements yet</div>
            )}
            <button
              type="button"
              onClick={onUploadNext}
              style={{
                background: 'transparent',
                border: 0,
                padding: 0,
                fontSize: 12,
                color: t.linkFg,
                marginTop: 6,
                fontWeight: 500,
                cursor: onUploadNext ? 'pointer' : 'default',
                fontFamily: 'inherit',
              }}
            >
              Upload next →
            </button>
          </div>
        </div>
      </section>

      {/* Spending + Merchants */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
          gap: 16,
        }}
      >
        <div style={card()}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>
            Spending by category
          </div>
          {cats.length === 0 ? (
            <div style={{ fontSize: 13, color: t.muted }}>
              No categorized spending yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cats.map((c) => (
                <div
                  key={c.name}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {money(c.cents)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: t.barTrack,
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(c.cents / maxCat) * 100}%`,
                        height: '100%',
                        background: t.barFill,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={card()}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>
            Top merchants
          </div>
          {merchants.length === 0 ? (
            <div style={{ fontSize: 13, color: t.muted }}>No merchant data yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {merchants.map((m, i) => (
                <div
                  key={m.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: t.numBg,
                      color: t.numFg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                    {m.name}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {money(m.cents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function BentoDash({ theme: t }: { theme: BentoTheme }) {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarItem = (
    label: string,
    iconChar: string,
    active: boolean,
    badge?: number | string,
    to?: string,
  ) => {
    const content = (
      <div
        style={{
          padding: '10px 12px',
          borderRadius: Math.max(8, t.radius / 1.5),
          background: active ? t.navActiveBg : 'transparent',
          color: active ? t.navActiveFg : t.navFg,
          fontWeight: active ? 600 : 500,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          transition: 'background .15s',
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: active ? t.navActiveIconBg : t.navIconBg,
            color: active ? t.navActiveIconFg : t.navIconFg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {iconChar}
        </span>
        {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!collapsed && badge ? (
          <span
            style={{
              background: t.badgeBg,
              color: t.badgeFg,
              padding: '1px 9px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
    );
    if (!to) return content;
    return (
      <Link key={label} to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  };

  const designSwitcher = (
    <div
      style={{
        display: 'flex',
        gap: 6,
        padding: collapsed ? '6px 0' : '6px 12px',
        marginTop: 4,
        flexWrap: 'wrap',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      {[
        { to: '/1', label: '1' },
        { to: '/2', label: '2', active: t.name === 'glass' },
        { to: '/3', label: '3', active: t.name === 'swiss' },
        { to: '/4', label: '4', active: t.name === 'bloom' },
      ].map((d) => (
        <Link
          key={d.to}
          to={d.to}
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            background: d.active ? t.primaryBg : t.chipBg,
            color: d.active ? t.primaryFg : t.fg,
            border: d.active ? '1px solid transparent' : t.chipBorder,
          }}
        >
          {d.label}
        </Link>
      ))}
    </div>
  );

  const data: BentoContentData = {
    monthLabel: mock.month,
    uncategorizedCount: mock.uncategorizedCount,
    totalSpentCents: mock.totalSpentCents,
    totalTransactions: mock.totalTransactions,
    categorizedPct: mock.categorizedPct,
    recentUncategorized: mock.recentUncategorized,
    byCategory: mock.byCategory,
    topMerchants: mock.topMerchants,
    statement: mock.statement,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.appBg,
        color: t.fg,
        fontFamily: t.font,
        display: 'flex',
      }}
    >
      {t.fontImport && <link rel="stylesheet" href={t.fontImport} />}

      <nav
        style={{
          width: collapsed ? 68 : 240,
          padding: '20px 16px',
          background: t.sidebarBg,
          borderRight: t.sidebarBorder,
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          position: 'sticky',
          top: 0,
          height: '100vh',
          alignSelf: 'flex-start',
          transition: 'width .18s ease',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 8px 16px',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: t.logoBg,
              color: t.logoFg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            F
          </div>
          {!collapsed && (
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>
              FinLens
            </div>
          )}
          <div style={{ flex: 1 }} />
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              style={{
                background: 'transparent',
                border: 0,
                color: t.muted,
                cursor: 'pointer',
                fontSize: 14,
                padding: 4,
              }}
            >
              «
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            style={{
              background: 'transparent',
              border: 0,
              color: t.muted,
              cursor: 'pointer',
              fontSize: 14,
              padding: 4,
              marginBottom: 6,
            }}
          >
            »
          </button>
        )}

        {sidebarItem('Dashboard', 'D', true, undefined, '/')}
        {sidebarItem('Categorize', 'C', false, mock.uncategorizedCount, '/categorize')}

        {!collapsed && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.2,
              color: t.muted,
              padding: '14px 12px 6px',
              textTransform: 'uppercase',
            }}
          >
            Admin
          </div>
        )}
        {sidebarItem('Transactions', 'T', false, undefined, '/transactions')}
        {sidebarItem('Categories', 'G', false, undefined, '/categories')}
        {sidebarItem('Statements', 'S', false, undefined, '/statements')}

        {!collapsed && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.2,
              color: t.muted,
              padding: '14px 12px 2px',
              textTransform: 'uppercase',
            }}
          >
            Designs
          </div>
        )}
        {designSwitcher}

        <div style={{ flex: 1 }} />

        <div
          style={{
            padding: '10px 12px',
            borderRadius: Math.max(8, t.radius / 1.5),
            background: t.profileBg,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex' }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: t.av1,
                border: `2px solid ${t.profileBg}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: t.av1Fg,
              }}
            >
              P
            </div>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: t.av2,
                border: `2px solid ${t.profileBg}`,
                marginLeft: -8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: t.av2Fg,
              }}
            >
              N
            </div>
          </div>
          {!collapsed && (
            <div style={{ fontSize: 12, lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600 }}>Piotr &amp; Natalie</div>
              <div style={{ color: t.muted }}>shared</div>
            </div>
          )}
        </div>
      </nav>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
            borderBottom: t.headerBorder,
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: t.muted,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: 0.4,
              }}
            >
              Wednesday, May 13
            </div>
            <h1
              style={{
                margin: '4px 0 0',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-.4px',
                fontFamily: t.displayFont ?? t.font,
              }}
            >
              Hey Piotr &amp; Natalie
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              style={{
                background: t.chipBg,
                color: t.fg,
                border: t.chipBorder,
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {mock.month} ▾
            </button>
            <button
              type="button"
              style={{
                background: t.primaryBg,
                color: t.primaryFg,
                border: 0,
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Upload statement
            </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px 32px' }}>
          <BentoContent theme={t} data={data} />
        </div>
      </main>
    </div>
  );
}
