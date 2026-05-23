# Dashboard UX Audit

Audit of `web/src/pages/Dashboard.tsx` against the `ui-ux-pro-max` checklist.

The visual design is strong: the Bloom aesthetic is consistent, hierarchy reads well, and typography choices are deliberate. The gaps below are mostly **functional / dashboard-domain** and **accessibility**.

---

## 1. Information missing (the biggest gaps)

These change what the dashboard *is for*, not just how it looks.

- [ ] **Month-over-month delta.** The "$X spent this month" stat sits alone — no comparison to last month, no arrow/percent change. The single most-expected dashboard insight for spend.
- [ ] **Spending trend over time.** No daily/weekly line or bar chart. Quick Reference §10 (`chart-type`) calls trend → line; for finance this is table stakes.
- [ ] **Budget / income / net.** Expense-only view with no target, balance, or savings rate.
- [ ] **Recent uncategorized rows aren't clickable** (`Dashboard.tsx:362-369`). Users see actionable items but can't jump to one — they must bounce through "Categorize now" or "Open list".

## 2. Accessibility (CRITICAL — §1)

- [ ] **Loading skeleton has no SR announcement** — wrap in `role="status" aria-live="polite"` and add visually-hidden "Loading dashboard" text (`Dashboard.tsx:238`).
- [ ] **Error state is a dead end** (`Dashboard.tsx:229`) — no `role="alert"`, no retry button. Violates `error-recovery`.
- [ ] **Donut has no aria-label** (`Dashboard.tsx:601-628`) — add `role="img" aria-label="${pct}% categorized"`.
- [ ] **Month picker keyboard navigation incomplete** (`Dashboard.tsx:307-330`) — listbox doesn't handle ↑/↓/Esc/Home/End. Click-only.
- [ ] **No `prefers-reduced-motion` override** for `bloom-pulse`, hover transforms, and the 0.6s bar-fill width transition.
- [ ] **Emoji/unicode used as structural icons**: `⚘` `↺` `✓` `⌄` `→`. Per `no-emoji-icons`, swap for Lucide/Heroicons SVG.

## 3. Layout & responsive (§5)

- [ ] **Only one breakpoint** (980px). 375–768px is untested — `huge-num` at 120px and `b-title` at 44px will likely overflow on a 375px iPhone SE width with `padding: 36px`. Add 640px tier.
- [ ] **`recent-row` uses fixed 56px date column** (`Dashboard.tsx:847`) — doesn't adapt; long merchant names get squeezed.

## 4. Forms & feedback (§8)

- [ ] **No upload-success feedback** — modal closes silently and the dashboard refetches. Add a toast.
- [ ] **No empty-data distinction on charts** — "No categorized spending yet" is fine, but `loading-chart` says use a shimmer rather than the bare frame between fetch states.

## 5. Smaller polish

- [ ] **Prev / next month arrows** next to the picker — faster than opening the menu.
- [ ] **Heading hierarchy** (`heading-hierarchy`) — `h1` → `h3` skips `h2`. The action card's "168" number should probably be in an `h2`.
- [ ] **`<main>` landmark** — the page renders as a fragment; check `AppShell` wraps it in `<main>`.
- [ ] **`huge-num` at 168px** has no protection against 4-digit counts (e.g. uncategorized = 1000+) overflowing the column at the breakpoint.

---

## Suggested order of work

1. **Responsive design** (§3) — verify breakage at 375px first, then add the 640px tier and adapt typography / padding / grids.
2. **Accessibility wins** (§2) — clickable recent rows, SR labels on loading/error/donut, icon swap.
3. **MoM delta + trend sparkline** (§1) — highest-leverage product change; do this once the layout is stable.
4. **Toasts + chart shimmer** (§4).
5. **Polish pass** (§5).
