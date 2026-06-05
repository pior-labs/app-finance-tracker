# Phase 1 — Execution Plan

> **The goal of Phase 1 is simple:** you and your fiancée can upload a bank statement PDF, see the parsed transactions, and manually assign categories to them. That's it. No AI, no RAG, no agents. Just a working app.

**Status:** Complete as of 2026-06-05. Phase 1 is now the frozen baseline for Phase 2.

**Historical note:** Some early database setup details below refer to SQLite. The completed app now uses Postgres; the active Phase 2 plan and README reflect the current runtime.

---

## How to Use This Document

Work through the steps in order. Each step ends with a "Test it" section — don't move on until that test passes. If you get stuck, that's fine — the steps are small enough that you can ask for help on a specific piece without losing context.

**Estimated total time:** 2-3 weeks at a few hours per day.

---

## Frontend MVP Scope (Steps 6-9)

The frontend is **4 routes, a handful of custom components, and shadcn/ui for the building blocks.** Here's the full scope at a glance so you know exactly what you're building — nothing more.

**Routes:**

| Route            | Page          | Purpose                                          |
| ---------------- | ------------- | ------------------------------------------------ |
| `/login`         | Login         | Email + password form                            |
| `/`              | Dashboard     | Spending total, uncategorized count, category bars|
| `/transactions`  | Transactions  | Table with filters + inline categorization       |
| `/upload`        | Upload        | PDF upload + list of past uploads                |

**shadcn/ui components to install:**

| Component    | Used for                                                    |
| ------------ | ----------------------------------------------------------- |
| `button`     | All buttons (login, upload, navigation)                     |
| `input`      | Login form fields                                           |
| `card`       | Stat cards on dashboard, upload area                        |
| `table`      | Transaction list                                            |
| `select`     | Category dropdown (inline on each transaction row)          |
| `badge`      | Status indicators (needs_review, confirmed)                 |
| `sidebar`    | App shell navigation                                        |
| `dropdown-menu` | User menu (logout)                                       |
| `progress`   | Category spending bars on dashboard                         |
| `separator`  | Visual dividers                                             |

You install these with `npx shadcn@latest add button card table ...` etc. They get copied into `web/src/components/ui/` and you own the code.

**Custom components you build (using shadcn primitives):**

| Component          | Used where        | What it does                                    |
| ------------------ | ----------------- | ----------------------------------------------- |
| `AppShell`         | All protected pages | shadcn Sidebar + header with user name + logout|
| `ProtectedRoute`   | Router            | Redirects to `/login` if not authenticated      |
| `StatCard`         | Dashboard         | shadcn Card with a big number + label           |
| `CategoryBar`      | Dashboard         | shadcn Progress bar with label + amount         |

**What's shared between users:** Everything. This is a shared household view — both users see all transactions, all uploads, all stats. Auth exists to keep the app private, not to separate data.

**What's NOT in the MVP:** No categories management page (seed via DB). No charts library. No date range comparison. No export. No transaction search. No bulk categorization. No dark mode. No mobile-specific layout (it should be usable on mobile but doesn't need a dedicated design).

---

## Database Schema (4 Tables)

Four tables you define, plus Better Auth's managed tables (sessions, accounts). Better Auth handles its own schema through the Drizzle adapter.

### `users`

| Column        | Type           | Notes                    |
| ------------- | -------------- | ------------------------ |
| id            | integer, PK    | Auto-increment           |
| name          | text           | Display name             |
| email         | text, unique   | Login identifier         |
| password_hash | text           | Managed by Better Auth   |
| created_at    | timestamp      | Default now              |

### `categories`

| Column      | Type           | Notes                                              |
| ----------- | -------------- | -------------------------------------------------- |
| id          | integer, PK    | Auto-increment                                     |
| name        | text, unique   | "Groceries", "Dining Out", etc.                    |
| description | text           | "Supermarkets, grocery stores, food staples"       |
| keywords    | text           | "Loblaws, Metro, No Frills" — common merchants     |
| is_default  | boolean        | true for seeded categories, false for user-created |
| created_at  | timestamp      | Default now                                        |

Seed with ~15-20 defaults: Groceries, Dining Out, Transport, Rent/Mortgage, Utilities, Entertainment, Subscriptions, Healthcare, Insurance, Clothing, Personal Care, Home & Garden, Education, Gifts, Travel, Savings, Fees & Charges, Income, Other.

### `statements`

| Column            | Type                    | Notes                                       |
| ----------------- | ----------------------- | ------------------------------------------- |
| id                | integer, PK             | Auto-increment                              |
| uploaded_by       | integer, FK → users     | Who uploaded this                           |
| filename          | text                    | Stored filename on disk                     |
| original_filename | text                    | What the user's file was actually called    |
| institution       | text, nullable          | "TD", "RBC" — null for now, useful later    |
| period_start      | date, nullable          | First transaction date in the statement     |
| period_end        | date, nullable          | Last transaction date in the statement      |
| raw_text          | text, nullable          | Full extracted text from PDF                |
| created_at        | timestamp               | Default now                                 |

### `transactions`

| Column           | Type                         | Notes                                              |
| ---------------- | ---------------------------- | -------------------------------------------------- |
| id               | integer, PK                  | Auto-increment                                     |
| statement_id     | integer, FK → statements     | Which upload this came from                        |
| date             | date                         | Transaction date                                   |
| description      | text                         | Raw text from the bank statement                   |
| merchant         | text, nullable               | Cleaned merchant name, extracted during parsing    |
| amount           | integer                      | **Stored in cents** (see below)                    |
| type             | text                         | "debit" or "credit"                                |
| category_id      | integer, FK → categories, nullable | Null until categorized                        |
| status           | text                         | "needs_review" or "confirmed"                      |
| created_at       | timestamp                    | Default now                                        |

**Why cents?** Floating point math breaks with money. `19.99 + 0.01` doesn't always equal `20.00` in JavaScript. Store `1999` as an integer, divide by 100 only at display time: `(amount / 100).toFixed(2)`.

**Why a separate merchant column?** The raw `description` from a bank statement is messy — something like "POS PURCHASE - LOBLAWS #4521 TORONTO ON". The `merchant` column stores the cleaned-up name ("Loblaws") extracted during PDF parsing. This enables merchant-level analytics without fuzzy text matching.

**Status flow:**

```
Upload → "needs_review" (no category yet)
   ↓
Human picks category → "confirmed"
```

### What's NOT in the schema (and why)

**No `category_examples` table** — no RAG in this project. The AI Brain handles that.

**No `confidence_score` or `categorized_by`** — all categorization is manual.

**No `budgets` or `reports` tables** — this is a tracker, not an analyst.

**No `settings` or `preferences` table** — two users, hardcode what you need.

---

## Step 1 — Get the Scaffold Running

**Time:** 1-2 hours

You've already scaffolded the repo with Claude Code. Before writing any new code, make sure what you have actually runs.

**Do this:**

1. Run `pnpm install` at the root
2. Start the API: `cd api && pnpm dev` — confirm it starts without errors
3. Start the frontend: `cd web && pnpm dev` — confirm it loads in the browser
4. If using Docker Compose: run `docker compose up` and confirm both services start
5. Hit the API from the browser or curl — any route, even a 404, just confirm it responds

**Test it:** You see the React app in your browser and the API responds to requests. Nothing is broken out of the box.

**If it doesn't work:** Fix it now. Don't build on a broken foundation. Dependency issues, port conflicts, TypeScript config problems — sort them all out before moving on.

---

## Step 2 — Database & Auth

**Time:** 2-3 hours

**Do this:**

1. Verify the Drizzle schema matches the **Database Schema** section above (all 4 tables)
2. Pay special attention to `transactions.amount` — it must be an integer (cents), not a float
3. Set up Better Auth with the Drizzle adapter:
   - Install `better-auth` and configure it with your SQLite database
   - Better Auth will create its own tables (sessions, accounts) through Drizzle
   - Configure email + password authentication (no OAuth needed)
4. Run the migration so the SQLite database file gets created in `/data`
5. Create a seed script (`api/src/db/seed.ts`) that:
   - Creates two user accounts (you and your fiancée) using Better Auth's API
   - Inserts the ~15-20 default categories
6. Run the seed script and verify the data is in the database
7. Add Better Auth's middleware to protect all `/api/*` routes except auth endpoints

Better Auth gives you secure session handling, CSRF protection, and proper cookie settings out of the box — you don't need to implement any of that yourself.

**Test it:**

```bash
# Login (Better Auth's built-in endpoint)
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "you@email.com", "password": "yourpassword"}' \
  -c cookies.txt

# Check session
curl http://localhost:3000/api/auth/get-session -b cookies.txt
# Should return your user + session object

# Without cookies
curl http://localhost:3000/api/auth/get-session
# Should return 401
```

---

## Step 3 — PDF Upload & Storage

**Time:** 1-2 hours

Don't parse the PDF yet. Just get the upload flow working.

**Do this:**

1. Build the upload endpoint: `POST /api/statements/upload`
   - Accept a PDF file
   - Save it to `/data/uploads/{userId}/{filename}`
   - Create a `statements` row in the database (user_id, filename, upload_date)
   - Return the created statement record
2. Build a simple listing endpoint: `GET /api/statements`
   - Returns all statements (household view — not filtered by user)

**Test it:**

```bash
# Upload a PDF
curl -X POST http://localhost:3000/api/statements/upload \
  -b cookies.txt \
  -F "file=@/path/to/your/bank-statement.pdf"
# Should return the statement record with an ID

# List statements
curl http://localhost:3000/api/statements -b cookies.txt
# Should show the statement you just uploaded
```

The PDF just sits on disk for now. That's fine.

---

## Step 4 — PDF Parsing & Merchant Extraction (The Hard Part)

**Time:** 3-5 hours (possibly more — this is the trickiest step)

This is where you turn a PDF into structured transaction data. Since you're using the same bank for all statements, you only need to handle one format.

**Do this:**

1. Install a PDF parsing library. Options for TypeScript:
   - `pdf-parse` — simple text extraction, good starting point
   - `pdf2json` — gives you positional data if you need table structure
   - Or call a Python script using `pdfplumber` (better at tables) as a subprocess
2. Start by extracting the raw text from one of your statements and printing it to the console. Look at the output. Understand the structure. Where do transactions start? What separates them? Is it line-by-line? Tabular?
3. Write a parser function specific to your bank's format:
   - Input: raw PDF text (or the PDF buffer)
   - Output: array of `{ date, description, merchant, amount, type }` objects
   - Handle edge cases: multi-line descriptions, page headers/footers that appear in the middle of transactions, totals rows you need to skip
4. **Merchant extraction** — write a function that takes the raw description and extracts a clean merchant name:
   - "POS PURCHASE - LOBLAWS #4521 TORONTO ON" → "Loblaws"
   - "INTERAC PURCHASE - AMAZON.CA" → "Amazon"
   - "PRE-AUTHORIZED - NETFLIX" → "Netflix"
   - Strip transaction codes, store numbers, location info
   - This is string parsing — no AI needed
   - Some transactions won't have a clear merchant (ATM withdrawals, transfers) — set merchant to null for those
5. Write tests for this parser. Use a real statement as a fixture. Assert the correct number of transactions, spot-check specific ones, verify merchant extraction.
6. Integrate into the upload flow:
   - After saving the PDF, run the parser
   - Store the extracted raw text in `statements.raw_text`
   - Set `period_start` and `period_end` from the first/last transaction dates
   - Insert each parsed transaction into the `transactions` table with `status = 'needs_review'`

**Test it:**

```bash
# Upload a real statement
curl -X POST http://localhost:3000/api/statements/upload \
  -b cookies.txt \
  -F "file=@/path/to/your/bank-statement.pdf"

# Get the transactions for that statement
curl http://localhost:3000/api/statements/{id}/transactions -b cookies.txt
# Should return parsed transactions with correct dates, amounts, descriptions, and merchants
```

**Manually verify:** Pick 5-10 transactions from the API response and cross-reference them with your actual bank statement. Do the amounts match? Are the dates right? Are descriptions captured fully? Are merchants extracted cleanly?

**Important:** Spend the time to get this right. If the parser misses transactions or mangles amounts, everything downstream will be wrong. It's okay if this step takes longer than expected.

---

## Step 5 — Transaction API Endpoints

**Time:** 1-2 hours

Build out the API routes you'll need for the frontend. This is a **shared household view** — both users see all transactions regardless of who uploaded them.

**Do this:**

1. `GET /api/transactions` — list all household transactions (not user-scoped)
   - Support query params: `?month=2026-03&category=&status=&merchant=`
   - Paginate (limit/offset) so the UI stays fast
   - Include the category name in the response (join with categories table)
   - Include the uploader's name so you can see who uploaded each statement
2. `PATCH /api/transactions/:id` — update a transaction
   - Allow setting: `category_id`, `status` (set to `confirmed` when manually categorized)
3. `GET /api/categories` — list all categories
4. `GET /api/transactions/stats` — basic household stats
   - Total spending for the current month
   - Count of uncategorized transactions
   - Spending breakdown by category (category name + total amount) for the current month
   - Top merchants by spending for the current month

**Test it:**

```bash
# Get all transactions
curl "http://localhost:3000/api/transactions" -b cookies.txt

# Filter by month
curl "http://localhost:3000/api/transactions?month=2026-03" -b cookies.txt

# Categorize a transaction manually
curl -X PATCH http://localhost:3000/api/transactions/1 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"category_id": 1, "status": "confirmed"}'

# Check stats
curl "http://localhost:3000/api/transactions/stats" -b cookies.txt
```

---

## Step 6 — Frontend: Login & App Shell

**Time:** 2-3 hours

Now you start making it real in the browser. The frontend has **4 routes total** — that's it.

```
/login         → Login page (public)
/              → Dashboard (protected)
/transactions  → Transaction list & categorization (protected)
/upload        → Upload statements (protected)
```

**Do this:**

1. Set up React Router with these 4 routes
2. Build a `<ProtectedRoute>` wrapper that checks auth state and redirects to `/login` if not logged in
3. Build the login page using shadcn components:
   - `Card` wrapping the form
   - `Input` for email and password
   - `Button` for submit
   - Calls Better Auth's sign-in endpoint
   - On success, redirect to `/`
   - Store auth state in a React context or a `useAuth()` hook
4. Build the app shell using shadcn's `Sidebar` component:
   - Sidebar with 3 navigation links: Dashboard, Transactions, Upload
   - Header showing the logged-in user's name + a `DropdownMenu` with logout
   - Main content area where the page renders

**Test it:** Open the browser. You're redirected to `/login`. Log in. You see the sidebar and an empty dashboard. Click each nav link — the URL changes, the page swaps. Click logout — back to login. Log in as your fiancée — same shell, same empty content.

---

## Step 7 — Frontend: Dashboard

**Time:** 2-3 hours

The dashboard is why you'd open this app. It answers two questions at a glance: "How much did we spend this month?" and "Do I have transactions to categorize?"

**Do this:**

1. **Stat cards row** — 2 cards at the top using shadcn `Card`:
   - "Spent this month" — total spending amount, large font
   - "Needs review" — count of uncategorized transactions. Make this clickable — navigates to `/transactions?status=needs_review`
2. **Spending by category** — below the stats:
   - Fetch from `GET /api/transactions/stats` (the category breakdown)
   - For each category: label, shadcn `Progress` bar (value proportional to highest category), dollar amount
   - Sort by amount descending
   - Only show categories that have spending (skip zero-amount categories)
3. **Empty state** — if no transactions exist yet, show a message: "No transactions yet. Upload your first statement." with a `Button` linking to `/upload`

**Test it:** Upload a statement via curl or the API (from Step 4). Manually categorize a few transactions via curl (from Step 5). Open the dashboard — you should see the total, the uncategorized count, and the category bars reflecting your manual categorizations. Click the "Needs review" card — you should land on the transactions page filtered to uncategorized.

---

## Step 8 — Frontend: Upload Page

**Time:** 1-2 hours

**Do this:**

1. **Upload section** at the top of the page:
   - A file `Input` with `type="file"` that only accepts PDFs (or a simple drag-and-drop area using a `Card`)
   - On file select, call `POST /api/statements/upload` with the file
   - Show a loading state while parsing: "Parsing statement..."
   - On success, show a summary: "Found X transactions from {startDate} to {endDate}"
   - Include a `Button`: "View transactions →" that navigates to `/transactions`
2. **Past uploads** below using shadcn `Table`:
   - Columns: filename, uploaded by, date uploaded, transaction count
   - Fetch from `GET /api/statements`
   - Most recent first

**Test it:** Upload a real statement through the UI. See the loading state. See the summary. Click through to transactions. Go back to the upload page — see the statement listed under past uploads.

---

## Step 9 — Frontend: Transaction List & Manual Categorization

**Time:** 3-4 hours

This is the core UI of Phase 1 — where you'll spend the most time interacting with the app.

**Do this:**

1. **Filter bar** at the top:
   - Month picker using `Select` (defaults to current month)
   - Category filter using `Select` (all categories + "All" + "Uncategorized")
   - Status filter using `Select`: All, Needs Review, Confirmed
2. **Transaction table** using shadcn `Table`:
   - Columns: date, merchant, description, amount, category, status
   - Show merchant prominently — this is the human-readable identifier
   - Fall back to description if merchant is null
   - Color amounts: red text for debits, green for credits (Tailwind `text-red-500` / `text-green-500`)
   - Status column shows a `Badge` — yellow for "needs_review", green for "confirmed"
   - Paginate at 50 rows per page (simple prev/next `Button`s)
3. **Inline category assignment** — this is the key interaction:
   - Each row has a `Select` dropdown in the category column
   - Selecting a category immediately calls `PATCH /api/transactions/:id` with the new category and `status: "confirmed"`
   - The `Badge` updates from yellow "needs review" to green "confirmed" without a page refresh
   - No save button — selection triggers the save
4. **No bulk actions for MVP.** One at a time is fine. You can add multi-select later if the manual flow feels slow.

**Test it:** Open the transaction list. See your real transactions from the uploaded statement. Assign categories to a few. Refresh the page — categories persist. Filter by "Uncategorized" — the ones you just categorized disappear. Filter by "Groceries" — only grocery transactions show. Go back to the dashboard — the stats and category bars reflect your changes.

---

## Step 10 — Deploy to Your VPS

**Time:** 2-3 hours

**Do this:**

1. Make sure Docker Compose works locally with a production-like config
2. Set up your VPS:
   - Clone the repo
   - Copy your `.env` file
   - Run `docker compose up -d`
3. Set up a reverse proxy (Caddy is the easiest — automatic HTTPS):
   - Point a domain or subdomain at your VPS
   - Caddy proxies to your API and serves the frontend
4. Test from your phone and your fiancée's phone

**Test it:** From your phone, navigate to `https://finlens.yourdomain.com` (or whatever you set up). Log in. Upload a statement. See the transactions. Categorize a few. Have your fiancée do the same from her phone.

---

## The Full Phase 1 Acceptance Test

When you're done, run through this scenario end to end:

1. Open the app on your phone
2. Log in
3. Upload this month's bank statement PDF
4. Verify the transaction count matches your actual statement
5. Spot-check 10 transactions for correct amounts, dates, and merchant names
6. Go to the dashboard — see "Spent this month" and the uncategorized count
7. Click the "Needs review" card — land on the transactions page filtered to uncategorized
8. Categorize 20 transactions manually using the inline dropdown
9. Go back to the dashboard — the category spending bars update to reflect your categorizations
10. Filter transactions by "Groceries" — see only what you categorized as groceries
11. Log out, log in as your fiancée
12. She can see all the same transactions (shared household view)
13. She uploads her statement — new transactions appear in the same shared pool
14. She categorizes a few — you log back in and see her categorizations

**If all of that works, Phase 1 is done.** You have a working, deployed, shared household finance tracker. No AI yet — but the foundation is solid, and Phase 2 (MCP server) has clean data and clear integration points to build on.

---

## Common Pitfalls to Avoid

**Don't over-engineer the frontend.** shadcn gives you great-looking components out of the box. Use them as-is. Don't customize themes, add animations, or tweak every border radius. Functional and clean is enough for Phase 1.

**Don't install every shadcn component upfront.** Only install what you need for the page you're currently building. The list in this doc is complete — if it's not listed, you don't need it yet.

**Don't try to support multiple bank formats yet.** Get one format working perfectly. Generalize in a future phase when you or your fiancée switch banks or add a credit card.

**Don't skip the parser tests.** Your bank will probably change their statement format slightly at some point. Tests let you catch that immediately instead of wondering why amounts are wrong three months later.

**Don't build the seed categories in the UI yet.** Seed them in the database directly. A "manage categories" UI is a nice-to-have you can add later — it's not needed to validate Phase 1.

**Don't rabbit-hole on Docker optimization.** `docker compose up` works? Good. Move on. Multi-stage builds and image size optimization can wait.
