# Dashboard UX Re-Audit

Re-audit of the dashboard experience using `ui-ux-pro-max` (priority order: accessibility, interaction, performance, layout, chart/data).  
Primary scope: `web/src/pages/Dashboard.tsx`; related shell feedback called out where relevant.

---

## 1. Findings (remaining gaps)

### High impact: dashboard insight depth

- [ ] **No month-over-month delta in the primary spend KPI.**  
  `Spent this month` still has no comparison signal (arrow, delta amount, delta %), so users cannot quickly judge change direction.  
  Ref: `Dashboard.tsx` spend stat card (`web/src/pages/Dashboard.tsx:555`).

- [ ] **No real trend visualization (daily/weekly spend over time).**  
  The spend card includes a decorative static SVG path, not data-driven trend data.  
  Ref: static path literal in `web/src/pages/Dashboard.tsx:569`.

- [ ] **No budget/income/net context.**  
  Dashboard remains expense-led only; no target, remaining budget, or net cashflow signal.

### Low/medium risk: responsive edge case

- [ ] **Very large hero number can still crowd some widths with 4+ digits.**  
  `HugeNum` scales to `lg:text-[168px]`; likely fine for most desktop sizes, but worth guarding with clamp or digit-aware scaling.  
  Ref: `web/src/pages/Dashboard.tsx:743`.

---

## 2. Resolved Since Last Audit

- [x] Recent uncategorized rows are now deep-link clickable.  
  Ref: `web/src/pages/Dashboard.tsx:480`.
- [x] Loading state now has SR-friendly status semantics (`role="status"`, `aria-live`).  
  Ref: `web/src/pages/Dashboard.tsx:321`.
- [x] Error state now has alert semantics and an immediate retry action.  
  Ref: `web/src/pages/Dashboard.tsx:300`.
- [x] Donut chart now has accessible labeling (`role="img"` + `aria-label`).  
  Ref: `web/src/pages/Dashboard.tsx:847`.
- [x] Month picker keyboard support now includes arrows, `Home`, `End`, and `Escape`.  
  Ref: `web/src/pages/Dashboard.tsx:263`.
- [x] Global reduced-motion handling is present.  
  Ref: `web/src/app.css:234`.
- [x] Upload flow now emits success toast feedback.  
  Ref: `web/src/components/UploadModal.tsx:39`.
- [x] Responsive behavior improved with mobile-first classes and sm/lg adaptation across sections.
- [x] Heading hierarchy in dashboard content now uses `h2` section titles under the page `h1`.  
  Ref: `web/src/pages/Dashboard.tsx`.
- [x] App shell navigation now uses Lucide SVG icons instead of unicode glyphs.  
  Ref: `web/src/components/AppShell.tsx`.

---

## 3. Recommended Next Pass (priority order)

1. **Add comparative finance insight**: MoM delta for spend + one real trend chart.
2. **Add one “balance context” KPI**: budget remaining, income vs spend, or net for month.
3. **Harden giant number scaling**: clamp/fit behavior for 4+ digit uncategorized values.
