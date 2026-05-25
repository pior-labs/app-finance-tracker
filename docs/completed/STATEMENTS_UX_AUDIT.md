# Statements UX Re-Audit

Audit of `web/src/pages/Statements.tsx` using the `ui-ux-pro-max` checklist (priority-first: accessibility, interaction, performance, layout, feedback).

Primary scope: `web/src/pages/Statements.tsx`.

---

## 1. Resolved Since Last Audit

- [x] **Error state now includes alert semantics and an inline recovery action.**  
  Error feedback is announced with `role="alert"` and includes a retry button wired to reload statements.  
  Ref: `web/src/pages/Statements.tsx:199`, `web/src/pages/Statements.tsx:201`, `web/src/pages/Statements.tsx:212`.

- [x] **Loading states now expose SR status semantics and busy-state signaling.**  
  Both desktop and mobile now announce loading progress (`role="status"`, `aria-live`) and use `aria-busy` on content containers.  
  Ref: `web/src/pages/Statements.tsx:226`, `web/src/pages/Statements.tsx:259`, `web/src/pages/Statements.tsx:484`, `web/src/pages/Statements.tsx:487`.

- [x] **Structural/action Unicode glyphs were replaced with Lucide SVG icons.**  
  Upload, status, action buttons, and warning footer now use a consistent icon set.  
  Ref: `web/src/pages/Statements.tsx:2`, `web/src/pages/Statements.tsx:194`, `web/src/pages/Statements.tsx:430`, `web/src/pages/Statements.tsx:448`, `web/src/pages/Statements.tsx:459`, `web/src/pages/Statements.tsx:470`, `web/src/pages/Statements.tsx:625`, `web/src/pages/Statements.tsx:694`, `web/src/pages/Statements.tsx:704`, `web/src/pages/Statements.tsx:714`, `web/src/pages/Statements.tsx:737`.

- [x] **Desktop row action targets were enlarged for better precision.**  
  Desktop icon controls now use `h-9 w-9` hit targets.  
  Ref: `web/src/pages/Statements.tsx:444`, `web/src/pages/Statements.tsx:455`, `web/src/pages/Statements.tsx:466`.

- [x] **Statement action parity is now implemented for view + re-parse.**  
  "View transactions" now deep-links to `/transactions` with `focus` and month context, and "Re-parse" is now wired end-to-end via a dedicated API route.  
  Ref: `web/src/pages/Statements.tsx:98`, `web/src/pages/Statements.tsx:114`, `web/src/pages/Statements.tsx:127`, `web/src/pages/Statements.tsx:131`, `api/src/routes/statements.ts:266`.

- [x] **Mobile transaction unit pluralization bug was fixed.**  
  The label now correctly renders `tx` vs `txs`.  
  Ref: `web/src/pages/Statements.tsx:676`.

- [x] **Optional polish completed: row-level pending guards for async actions.**  
  View, re-parse, and delete now set per-row pending state, disable duplicate actions while in-flight, and expose visual progress affordance.  
  Ref: `web/src/pages/Statements.tsx:52`, `web/src/pages/Statements.tsx:85`, `web/src/pages/Statements.tsx:90`, `web/src/pages/Statements.tsx:334`, `web/src/pages/Statements.tsx:579`.

---

## 2. Findings (remaining gaps)

- No outstanding issues from this audit pass.

---

## 3. Strengths Already Present

- [x] **Primary upload action is prominent and touch-friendly.**  
  The header CTA uses `min-h-11`, full-width on narrow screens, and strong visual contrast.  
  Ref: `web/src/pages/Statements.tsx:183`, `web/src/pages/Statements.tsx:185`.

- [x] **Empty states are implemented for both desktop and mobile, each with direct upload CTA.**  
  Ref: `web/src/pages/Statements.tsx:279`, `web/src/pages/Statements.tsx:310`, `web/src/pages/Statements.tsx:516`, `web/src/pages/Statements.tsx:555`.

- [x] **Status communication is not color-only.**  
  Failed/imported states include text labels, supporting better scannability and accessibility than color-only chips.  
  Ref: `web/src/pages/Statements.tsx:419`, `web/src/pages/Statements.tsx:431`, `web/src/pages/Statements.tsx:614`, `web/src/pages/Statements.tsx:626`.

- [x] **Mobile actions use strong touch targets.**  
  The mobile action row uses `h-11` / `min-w-11` controls, which is good for thumb ergonomics.  
  Ref: `web/src/pages/Statements.tsx:691`, `web/src/pages/Statements.tsx:701`, `web/src/pages/Statements.tsx:711`.

- [x] **Upload flow closes the loop by refreshing data on completion.**  
  `onUploadComplete` re-fetches statements immediately, improving perceived reliability.  
  Ref: `web/src/pages/Statements.tsx:744`.

---

## 4. Recommended Next Pass (priority order)

1. Optional QA polish: run a quick manual pass validating `re-parse` behavior on both populated and empty statements to confirm error copy and reloaded counts feel clear.
