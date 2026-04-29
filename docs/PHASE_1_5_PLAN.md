# Phase 1.5 — Pivot to Merchant-First Model

> Bridge plan from the current Phase 1 (fine-grained categories, no merchant model) to the revised PROJECT_SPEC. **This is not Phase 2.** No RAG, no Qdrant, no LLM calls. Phase 1.5 is purely structural: rework the data model, replace seeds, add a merchant resolver, and update the UI accordingly.

---

## Goal

Get the existing app aligned with the revised spec so Phase 2 (RAG Q&A) has the right foundation to build on. Specifically:

1. Replace fine-grained categories with coarse buckets.
2. Introduce `merchants` + `merchant_rules` as the primary transaction grouping.
3. Resolve merchants deterministically at parse time (no AI yet — that's Phase 2's auto-classifier for *new* merchants).
4. Update the UI so merchants are first-class, with categories acting as a thin coarse rollup.
5. Preserve existing transaction data (don't wipe).

---

## Definition of Done

- Existing transactions still exist, still have meaningful categories (mapped from old → new), and now also have a resolved `merchant_id` where a rule matched.
- Uploading a new statement automatically resolves merchants for transactions whose descriptions match a rule. Unmatched ones land in a review queue.
- A `Merchants` page lets you view merchants, edit their default category, view/edit/add rules, and see all transactions resolved to a given merchant.
- The Transactions page shows a merchant column; the Dashboard shows top merchants alongside the category rollup.
- Category list is the coarse 5-bucket set; old fine-grained categories are gone.
- App still builds, tests pass, and you can use it end-to-end as before.

---

## Order of operations

The order matters because some steps depend on others (schema before backfill before backend changes before frontend). Tackle in this order; commit per logical chunk.

### 1. Schema changes

Update [api/src/db/schema.ts](api/src/db/schema.ts):

**Add** `merchants` table:
- `id` (PK, autoincrement)
- `name` (text, unique, notNull)
- `defaultCategoryId` (integer, FK → categories.id, nullable)
- `notes` (text, nullable)
- `createdAt` (timestamp default now)

**Add** `merchantRules` table:
- `id` (PK, autoincrement)
- `pattern` (text, notNull) — substring or regex; document which one we pick (recommend simple substring match, case-insensitive, with optional regex flag column later if needed)
- `merchantId` (integer, FK → merchants.id, notNull)
- `priority` (integer, default 100) — lower number checked first
- `createdAt` (timestamp default now)

**Modify** `transactions`:
- Add `merchantId` (integer, FK → merchants.id, nullable)
- Add `notes` (text, nullable)

**Modify** `categories`:
- Drop `keywords` column (no longer used; merchant rules replace it).

**Drop** `categoryExamples` table:
- Created in Phase 1 but never populated. Revised spec doesn't use it. Drop now to avoid carrying dead schema.

**Update relations** at the bottom of the file:
- `merchantRelations`: hasMany transactions, hasMany merchantRules, belongsTo defaultCategory
- `merchantRuleRelations`: belongsTo merchant
- `transactionRelations`: add `merchant` belongsTo
- `categoryRelations`: drop the `examples` relation; add `defaultMerchants` hasMany

Generate the migration with `pnpm drizzle-kit generate` from `api/`.

### 2. Data migration (one-shot script)

Add `api/src/db/migrate-phase-1-5.ts`. This is a **one-shot** script, not a recurring migration. It runs once after the schema migration to remap existing data.

Logic:

1. Build the old → new category mapping (hardcoded in the script):

   | Old (fine)          | New (coarse)       |
   | ------------------- | ------------------ |
   | Groceries           | Essentials         |
   | Rent/Mortgage       | Essentials         |
   | Utilities           | Essentials         |
   | Transport           | Essentials         |
   | Healthcare          | Essentials         |
   | Insurance           | Essentials         |
   | Dining Out          | Discretionary      |
   | Entertainment       | Discretionary      |
   | Clothing            | Discretionary      |
   | Personal Care       | Discretionary      |
   | Home & Garden       | Discretionary      |
   | Education           | Discretionary      |
   | Gifts               | Discretionary      |
   | Travel              | Discretionary      |
   | Subscriptions       | Subscriptions      |
   | Income              | Income             |
   | Savings             | Transfers          |
   | Fees & Charges      | Other              |
   | Other               | Other              |

2. Open a transaction:
   - Insert the new coarse categories (idempotent — `onConflictDoNothing` on name).
   - For each existing transaction with a `categoryId`, look up the old category name and update `categoryId` to the new coarse one.
   - Delete the old fine-grained category rows (anything not in the coarse seed list).

3. Run via `pnpm tsx src/db/migrate-phase-1-5.ts` (one time, on any environment with existing data — your VPS DB and local).

After this script runs, `categories` contains only the coarse set and existing transactions are remapped.

### 3. Update seed file

Rewrite [api/src/db/seed.ts](api/src/db/seed.ts):

- Replace `defaultCategories` with the coarse list (Essentials, Discretionary, Subscriptions, Income, Transfers, Other).
  - Drop the `keywords` field (column no longer exists).
  - Keep `description` — useful as Phase 2 RAG context.
- Add `seedMerchants()` and `seedMerchantRules()` functions.
- Seed a starter set of ~20-30 merchants for your common Canadian patterns. Examples: Loblaws, Metro, No Frills, Walmart, Costco, FreshCo, Tim Hortons, Starbucks, Uber Eats, DoorDash, SkipTheDishes, Amazon, Netflix, Spotify, Apple, Rogers, Bell, Hydro One, Enbridge, Shell, Petro-Canada, Cineplex, Shoppers Drug Mart, IKEA, Home Depot, Canadian Tire, Air Canada, WestJet.
- For each merchant, seed at least one rule (substring pattern matching the typical bank-statement-line text). Example: `{ pattern: "AMZN", merchantId: amazonId, priority: 100 }`, `{ pattern: "AMAZON", merchantId: amazonId, priority: 100 }`, `{ pattern: "TIM HORTONS", merchantId: timsId, priority: 100 }`.
- Each merchant gets a sensible `defaultCategoryId` (Loblaws → Essentials, Netflix → Subscriptions, Amazon → Discretionary, etc.).

Make all seed inserts idempotent (`onConflictDoNothing`).

### 4. Merchant resolver service

Add `api/src/services/merchant-resolver.ts`:

```ts
// Pseudocode
export async function resolveMerchant(description: string): Promise<{
  merchantId: number;
  defaultCategoryId: number | null;
} | null> {
  const rules = await db.query.merchantRules.findMany({
    orderBy: [asc(merchantRules.priority)],
    with: { merchant: true }
  });
  const upper = description.toUpperCase();
  for (const rule of rules) {
    if (upper.includes(rule.pattern.toUpperCase())) {
      return {
        merchantId: rule.merchant.id,
        defaultCategoryId: rule.merchant.defaultCategoryId
      };
    }
  }
  return null;
}
```

Notes:
- Cache the rules in-memory and invalidate on rule create/update/delete (rules are small and read-heavy).
- Stick with substring matching for v1. Regex is a flag we can add later if needed.

### 5. Wire resolver into statement parsing

Update [api/src/routes/statements.ts](api/src/routes/statements.ts):

- In the upload path (`POST /`), after parsing transactions and before inserting, call `resolveMerchant(description)` for each. Set `merchantId` and prepopulate `categoryId` from the merchant's default. If no rule matches, leave both null and set `status = 'needs_review'`.
- Apply the same logic in the reprocess path (`POST /:id/reprocess`).

### 6. One-time backfill of existing transactions

Add to the same migration script (`migrate-phase-1-5.ts`) or a separate `backfill-merchants.ts` — your call. Iterate every existing transaction, call `resolveMerchant(description)`, and update `merchantId` (don't touch `categoryId` — that's already been remapped in step 2). Transactions with no rule match stay `merchantId = null`.

### 7. Backend API additions

**New** `api/src/routes/merchants.ts`:

- `GET /api/merchants` — list with rule count + transaction count
- `GET /api/merchants/:id` — detail with all rules and recent transactions
- `POST /api/merchants` — create
- `PATCH /api/merchants/:id` — update name, default category, notes
- `DELETE /api/merchants/:id` — refuse if transactions reference it (or null them out — pick a UX, document it)
- `POST /api/merchants/:id/rules` — add rule
- `PATCH /api/merchant-rules/:id` — update rule
- `DELETE /api/merchant-rules/:id` — delete rule
- `POST /api/merchants/:id/reapply-rules` — re-resolve all transactions against current rules (useful after editing patterns)

Mount in [api/src/index.ts](api/src/index.ts).

**Update** [api/src/routes/transactions.ts](api/src/routes/transactions.ts):

- Include `merchant` in the response (id, name).
- Accept `merchant` query filter (similar to `category`).
- Add `merchant_id` and `notes` to the patch schema so users can override merchant assignment and edit notes.
- Update the `byCategory` stats query to also produce a `byMerchant` rollup (top N merchants for the period, with totals).

### 8. Frontend changes

**New** [web/src/pages/Merchants.tsx](web/src/pages/Merchants.tsx):

- Table of merchants: name, default category, rule count, transaction count this month.
- Detail/edit drawer or modal: rename, change default category, add/edit/delete rules, "reapply rules" button.
- Add a route in [web/src/App.tsx](web/src/App.tsx).
- Add nav entry in [web/src/components/AppShell.tsx](web/src/components/AppShell.tsx).

**Update** [web/src/pages/Transactions.tsx](web/src/pages/Transactions.tsx):

- Add a merchant column.
- Add a merchant filter (alongside the existing category filter).
- Inline merchant override (similar to inline category change today).
- Notes field on the row drawer/modal.

**Update** [web/src/pages/Dashboard.tsx](web/src/pages/Dashboard.tsx):

- Add a "Top merchants this month" panel next to the category bar.
- Replace `CategoryBar` data with the coarse buckets (it'll now be 5 segments instead of 19; visually cleaner anyway).

**Update** [web/src/pages/Categories.tsx](web/src/pages/Categories.tsx):

- Now lists only the coarse buckets. Wording on the page should reflect this is a small intentional set, not an exhaustive taxonomy. User can still add custom buckets if they want.

### 9. Cleanup

- Delete any code referencing the old `categoryExamples` (search the codebase — likely none in routes, but worth a grep).
- Delete any code referencing `categories.keywords` (the field is gone).
- Update `docs/PHASE_1_PLAN.md` if you want it to reflect the post-pivot state, or leave it as historical record. Recommend adding a note at the top: *"This plan describes the original Phase 1 build. The merchant-first pivot is documented in PHASE_1_5_PLAN.md."*
- Replace [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) with the contents of [docs/PROJECT_SPEC_REVISED.md](docs/PROJECT_SPEC_REVISED.md) once Phase 1.5 is merged. Or do it as a separate cleanup commit beforehand — either works.

---

## What's explicitly NOT in Phase 1.5

- **No RAG, no Qdrant, no embeddings, no LLM.** That's Phase 2.
- **No automatic categorization of new merchants by AI.** Right now, an unmatched description means: a new merchant is *manually* created (or the user adds a rule that points to an existing merchant). Phase 2 adds the LLM-powered auto-classifier for new merchants.
- **No reimbursement linking.** Deferred to whenever chequing-account import lands.
- **No chat UI.** Phase 2.
- **No agent or insights.** Phase 4.

---

## Estimated effort

5-7 days of focused work. Roughly:

- Schema + migration script: 1 day
- Merchant resolver + statement integration + backfill: 1 day
- Backend routes for merchants: 1 day
- Frontend Merchants page: 1-2 days
- Transactions/Dashboard UI updates: 1 day
- Test, polish, deploy: 1 day

---

## Open questions to resolve before starting

1. **Pattern matching: substring or regex?** Substring is simpler and likely sufficient for 95% of merchant lines. Regex would handle edge cases (e.g., merchant codes with variable suffixes). Recommend **substring case-insensitive** for v1, add a `pattern_type` column later if needed.
2. **Rule conflicts: what if two rules match?** Lowest `priority` wins. If equal, first-created wins. Document in the resolver.
3. **What happens when a user deletes a merchant referenced by transactions?** Option A: refuse. Option B: null out `merchantId` on those transactions. Recommend **A** — fewer surprises; force the user to reassign or merge first.
4. **Reapply rules — destructive or additive?** When the user clicks "reapply rules" on a merchant, does it overwrite manual merchant overrides? Recommend **only fill in null `merchantId`** by default, with an explicit "force overwrite" option for the user who knows what they're doing.
