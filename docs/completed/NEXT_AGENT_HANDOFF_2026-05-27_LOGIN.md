# Next Agent Handoff - 2026-05-27 - Login Route

## Session just completed

Route-by-route cleanup continued on branch `refactor/code-architecture`.

Recent completed route refactors:
- Dashboard route performance pass: `88df741`
- Categorize route split and optimization: `9bb7ae6`
- Transactions route split and handoff: `8bd9c04`
- Categories route split: `33e22c2`
- Statements route split: `0d8d131`

The Statements route was moved from `web/src/pages/Statements.tsx` into `web/src/pages/statements/`, split into route entry, SWR-backed hook, components, helpers, constants, and types. `web/src/App.tsx` now imports `StatementsPage` from `@/pages/statements`. Validation passed with:

```bash
pnpm -C web typecheck
```

## Next session objective

Continue the route-by-route cleanup with the Login route.

Recommended next target:
- `web/src/pages/Login.tsx`

Current baseline:
- `web/src/pages/Login.tsx` is much smaller than the recently completed route files.
- It already has a polished visual layout and good accessibility primitives: labelled fields, `useId`, `role="alert"`, `aria-live`, `aria-pressed`, focus rings, and loading state.
- There is no known completed Login UX audit under `docs/completed/` at the time of this handoff.

## Login route observations

`Login.tsx` currently combines these concerns in one file:
- Auth redirect and submit orchestration.
- Login form state and validation-adjacent state.
- Brand panel rendering.
- Form panel rendering.
- Reusable field rendering.
- Inline SVG icons for password visibility, error dot, submit arrow, and spinner.

Suggested extraction boundaries:
- `web/src/pages/login/index.tsx` as the route coordinator.
- `web/src/pages/login/components/BrandPanel.tsx`
- `web/src/pages/login/components/LoginFormPanel.tsx`
- `web/src/pages/login/components/LoginField.tsx`
- `web/src/pages/login/components/LoginErrorMessage.tsx`
- `web/src/pages/login/components/LoginSubmitButton.tsx`
- `web/src/pages/login/hooks/useLoginForm.ts` if the submit/state logic feels cleaner outside the route entry.

Keep the cleanup proportional. This route likely does not need as many files as Transactions, Categories, or Statements.

## Suggested approach

1. Move `web/src/pages/Login.tsx` to `web/src/pages/login/index.tsx` and update the route import in `web/src/App.tsx`.
2. Extract stable presentational components first, preserving the current visual design.
3. Replace hand-rolled SVG icons with `lucide-react` where there is a direct match:
   - `Eye`
   - `EyeOff`
   - `LoaderCircle` or another suitable spinner icon if it preserves the loading affordance
   - `ArrowRight`
4. Keep auth/navigation behavior unchanged:
   - Redirect authenticated users to `/`.
   - Submit via `login(email, password)`.
   - Navigate to `/` after a successful login.
   - Preserve error copy from thrown `Error` values.
5. Apply targeted Vercel React best-practice rules:
   - `rerender-functional-setstate`
   - `rerender-no-inline-components`
   - `rerender-memo`
   - `rendering-hoist-jsx`
   - `bundle-barrel-imports`
6. Run `pnpm -C web typecheck`.

## Coordination notes

- Be careful with `web/src/App.tsx`; recent route refactors have touched this file frequently.
- Do not revert unrelated local work. At the time this handoff was written, the only unrelated dirty worktree entry was a docs handoff move:
  - deleted: `docs/NEXT_AGENT_HANDOFF_2026-05-26.md`
  - untracked: `docs/completed/NEXT_AGENT_HANDOFF_2026-05-26.md`
- The next agent should avoid editing Categories or Statements unless needed for import consistency.

## Suggested skills

- `vercel-react-best-practices`
- `frontend-design` only if visual changes are intentionally requested; otherwise preserve the current design.
- `finlens-dev-workflow` for validation commands and repo workflow.
- `handoff` at the end of the session if another route remains.
