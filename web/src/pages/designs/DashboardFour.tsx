import { BentoDash, type BentoTheme } from './DashboardTwo';

/**
 * BLOOM (bento port) — Bloom's palette + fonts mapped onto the BentoDash
 * layout: cream paper, pistachio/peach/lavender accents, terracotta highlights,
 * Fraunces serif for display numerals + headings, Outfit for body.
 * Same structure as /2 and /3 — different paint.
 */
export function DashboardFour() {
  return <BentoDash theme={BLOOM_THEME} />;
}

export const BLOOM_THEME: BentoTheme = {
  name: 'bloom',
  font: '"Outfit", system-ui, sans-serif',
  displayFont: '"Fraunces", "Outfit", serif',
  fontImport:
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Outfit:wght@300;400;500;600;700&display=swap',
  appBg: '#fdf9f0',
  fg: '#2d2418',
  muted: '#9c8a73',
  radius: 24,
  sidebarBg: 'rgba(255,252,244,0.65)',
  sidebarBorder: '1px solid rgba(45,36,24,0.06)',
  headerBorder: '1px dashed rgba(45,36,24,0.12)',
  cardBg: '#fffdf7',
  cardBorder: '1px solid rgba(45,36,24,0.06)',
  cardShadow: '0 8px 22px -12px rgba(45,36,24,0.12)',
  navFg: '#574532',
  navIconBg: 'rgba(45,36,24,0.06)',
  navIconFg: '#574532',
  navActiveBg: '#2d2418',
  navActiveFg: '#fdf9f0',
  navActiveIconBg: '#cae0a8',
  navActiveIconFg: '#2d2418',
  badgeBg: '#f8d7c0',
  badgeFg: '#6b3a1f',
  logoBg: '#2d2418',
  logoFg: '#fdf9f0',
  profileBg: 'rgba(45,36,24,0.04)',
  av1: '#dcd3f0',
  av1Fg: '#3a2a5a',
  av2: '#f8d7c0',
  av2Fg: '#6b3a1f',
  primaryBg: '#2d2418',
  primaryFg: '#fdf9f0',
  chipBg: 'rgba(255,255,255,0.7)',
  chipBorder: '1px solid rgba(45,36,24,0.1)',
  actionBg:
    'linear-gradient(135deg, rgba(202,224,168,0.35) 0%, rgba(248,215,192,0.55) 100%)',
  actionFg: '#2d2418',
  actionLabel: '#9c5a3a',
  actionAccent: '#c5704a',
  actionBorder: '1px solid rgba(197,112,74,0.18)',
  actionBtnBg: '#2d2418',
  actionBtnFg: '#fdf9f0',
  actionGhostBorder: 'rgba(45,36,24,0.18)',
  actionRowBg: 'rgba(255,255,255,0.7)',
  actionRowFg: '#2d2418',
  actionRowMuted: '#9c8a73',
  actionRowBorder: '1px solid rgba(45,36,24,0.06)',
  thumbBg: '#f5efe2',
  thumbBorder: '1px solid rgba(45,36,24,0.08)',
  good: '#5d8a3f',
  barTrack: 'rgba(45,36,24,0.06)',
  barFill: '#c5704a',
  numBg: 'rgba(202,224,168,0.35)',
  numFg: '#3a5a26',
  linkFg: '#c5704a',
};
