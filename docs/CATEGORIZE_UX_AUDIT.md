# Categorize UX Audit

Audit of `web/src/pages/Categorize.tsx` using the `ui-ux-pro-max` checklist (priority-first: accessibility, interaction, performance, layout, feedback).

The page has a strong interaction concept and clear visual hierarchy, especially with shortcuts and queue flow. The previously identified high-priority issues are now addressed.

---

## 1. Resolved in latest pass

- [x] Added explicit fetch error handling and retry UI (`error-recovery`).  
  Ref: `web/src/pages/Categorize.tsx:120`, `web/src/pages/Categorize.tsx:361`
- [x] Loading skeleton now includes SR semantics (`role="status"`, `aria-live`, `aria-busy`).  
  Ref: `web/src/pages/Categorize.tsx:346`
- [x] Category menu now has listbox semantics and keyboard support (`ArrowUp/Down`, `Home/End`, `Enter/Space`, `Escape`).  
  Ref: `web/src/pages/Categorize.tsx:614`, `web/src/pages/Categorize.tsx:643`
- [x] Assignment controls are now guarded while a category action is in-flight (`loading-buttons`).  
  Ref: `web/src/pages/Categorize.tsx:162`, `web/src/pages/Categorize.tsx:581`
- [x] Undo touch target now meets 44px guidance (`min-h-11`).  
  Ref: `web/src/pages/Categorize.tsx:833`
- [x] Key structural glyphs were replaced with Lucide icons (check/chevron/forward-arrow usage).  
  Ref: `web/src/pages/Categorize.tsx:410`, `web/src/pages/Categorize.tsx:636`, `web/src/pages/Categorize.tsx:732`
- [x] Undo now shows user-facing error feedback when uncategorize fails.  
  Ref: `web/src/pages/Categorize.tsx:232`, `web/src/pages/Categorize.tsx:245`
- [x] “Up next” row indicator color now derives from each row’s own transaction type.  
  Ref: `web/src/pages/Categorize.tsx:799`
- [x] “Just confirmed” amount sign now respects credit/debit type.  
  Ref: `web/src/pages/Categorize.tsx:900`
