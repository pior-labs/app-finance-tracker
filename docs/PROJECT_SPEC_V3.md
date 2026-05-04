# FinLens — Personal Finance Tracker

> A self-hosted personal finance tracker for two users. Upload bank statement PDFs, manually categorize transactions with a clean UI, and expose your finance data as an MCP server for conversational queries.

---

## Why This Project Exists

My fiancée and I wanted a simple, private way to track our spending without handing our financial data to a third-party app. We upload our bank statements, the system parses every transaction and extracts merchants, and we manually categorize them with a UI that makes the process quick and satisfying. No subscriptions to Mint. No spreadsheets. Just a self-hosted tool that works for us.

The MCP server makes the data conversationally accessible — open Claude Desktop and ask "How much did we spend on Amazon last month?" and get an answer from real data.

---

## Tech Stack (Introduced Gradually)

Not everything is installed on day one. Each phase introduces only what it needs.

| Technology            | Introduced in | Why                                                        |
| --------------------- | ------------- | ---------------------------------------------------------- |
| Hono (TypeScript)     | Phase 1       | Lightweight API server, web-standards                      |
| React 19 + Vite       | Phase 1       | SPA frontend, fast builds, static output                   |
| Tailwind CSS v4       | Phase 1       | Utility-first styling, v4 for the latest CSS-first config  |
| shadcn/ui             | Phase 1       | Pre-built accessible components, you own the code          |
| Better Auth           | Phase 1       | Production-grade auth with Drizzle adapter, secure defaults|
| SQLite + Drizzle ORM  | Phase 1       | Zero-config database, file-based, easy backups             |
| Docker Compose        | Phase 1       | Deployment on VPS                                          |
| MCP TypeScript SDK    | Phase 2       | Expose finance data as an MCP server                       |

---

## How This Project Grows

```
Phase 1:  finlens/
          ├── api/          ← Hono server, Drizzle, PDF parsing
          ├── web/          ← React + Vite + Tailwind v4 + shadcn
          ├── docs/         ← Project specs and phase plans
          └── docker-compose.yml

Phase 2:  (convert to monorepo, add MCP server)
          ├── packages/
          │   ├── api/               ← moved here
          │   ├── web/               ← moved here
          │   ├── mcp-server/        ← NEW: standalone MCP server
          │   └── shared/            ← NEW: shared types extracted
          ├── docs/                  ← stays at root
          ├── pnpm-workspace.yaml    ← NEW: monorepo config
          └── docker-compose.yml
```

**Use pnpm from day one** even though Phase 1 isn't a monorepo. This way the conversion in Phase 2 is painless.

---

## Phased Roadmap

Two phases. Each one is a working, deployable app. **Do not start Phase 2 until Phase 1 is solid.**

---

### Phase 1 — Foundation & Manual Categorization

**What it does:** Upload a PDF bank statement, extract transactions and merchants, view them in a shared household dashboard, and manually categorize them with a clean, efficient UI.

**What you'll learn:** Hono, Drizzle ORM, Tailwind v4, shadcn/ui, PDF parsing, Docker Compose, deploying to a VPS.

**What gets installed:**
- hono
- drizzle-orm + better-sqlite3
- better-auth (authentication)
- pdf-parse (PDF extraction)
- react + react-dom + react-router
- vite
- tailwindcss v4
- shadcn/ui components (see Phase 1 plan for which ones)

**Project structure when done:**

```
finlens/
├── api/
│   ├── src/
│   │   ├── index.ts              # Hono app entry
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── statements.ts
│   │   │   ├── transactions.ts
│   │   │   └── categories.ts
│   │   ├── services/
│   │   │   └── pdf-parser.ts     # Your bank's statement parser
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle schema
│   │   │   ├── seed.ts           # Seed users + categories
│   │   │   └── index.ts          # DB connection
│   │   ├── middleware/
│   │   │   └── auth.ts           # Better Auth middleware
│   │   └── lib/
│   │       └── types.ts          # Shared types (for now, local)
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx               # Router setup (4 routes)
│   │   ├── app.css               # Tailwind v4 entry
│   │   ├── lib/
│   │   │   └── utils.ts          # cn() helper for shadcn
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   └── Upload.tsx
│   │   ├── components/
│   │   │   ├── ui/               # shadcn components (auto-generated)
│   │   │   ├── AppShell.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── CategoryBar.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   ├── components.json           # shadcn config
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── PROJECT_SPEC.md
│   └── PHASE_1_PLAN.md
├── data/                          # gitignored — DB + uploaded PDFs
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

**Definition of Done:**
- You and your fiancée can upload statements, see transactions with merchants, and manually categorize them.
- Data is shared between both accounts (household view).
- Deployed to your VPS with HTTPS.
- PDF parser correctly extracts all transactions and merchants from your bank's format.
- The categorization UX feels quick and satisfying, not tedious.

**Estimated Effort:** 2-3 weeks

**Detailed execution plan:** docs/PHASE_1_PLAN.md

---

### Phase 2 — MCP Server

**What it does:** Exposes your finance data as an MCP server. Open Claude Desktop and ask "How much did we spend on groceries last month?" or "What are our top merchants?" and get answers from real data.

**What you'll learn:** MCP protocol, tool design, resource definitions, the MCP TypeScript SDK, monorepo setup.

**What gets added:**
- `@modelcontextprotocol/sdk` package
- A new `mcp-server` package
- Convert the project to a pnpm monorepo (move `api/` and `web/` into `packages/`)
- Extract shared types into a `shared` package

**Why the monorepo conversion happens now:** The MCP server is a separate process that shares types and database access with the API. That's the first time you genuinely need multiple packages. Doing it earlier would be premature structure.

**What changes in the project:**

```
finlens/
├── packages/
│   ├── api/                          # moved from root
│   ├── web/                          # moved from root
│   ├── mcp-server/                   # NEW
│   │   ├── src/
│   │   │   ├── index.ts             # MCP server entry
│   │   │   └── tools/
│   │   │       ├── spending.ts      # get_spending_summary, compare_months
│   │   │       ├── transactions.ts  # get_transactions, search_transactions
│   │   │       ├── merchants.ts     # get_top_merchants, get_merchant_spending
│   │   │       └── categories.ts    # get_category_breakdown
│   │   └── package.json
│   └── shared/                       # NEW: extracted from api/lib/types.ts
│       ├── src/
│       │   └── types.ts
│       └── package.json
├── docs/
│   └── PHASE_2_PLAN.md               # NEW: written when you start Phase 2
├── pnpm-workspace.yaml               # NEW
└── docker-compose.yml                 # Updated: adds MCP server
```

**Definition of Done:**
- Claude Desktop can connect to your MCP server.
- You can ask natural language questions about your finances and get accurate answers.
- Merchant queries work: "What did we spend at Amazon this year?"
- The MCP server runs alongside the API in Docker Compose.

**Estimated Effort:** 1-2 weeks

---

## Database Schema

Four tables you define, plus Better Auth's managed tables (sessions, accounts). Better Auth handles its own schema through the Drizzle adapter — you don't need to manage session tables manually.

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
| is_default  | boolean        | true for seeded, false for user-created            |
| created_at  | timestamp      | Default now                                        |

Seed ~15-20 defaults: Groceries, Dining Out, Transport, Rent/Mortgage, Utilities, Entertainment, Subscriptions, Healthcare, Insurance, Clothing, Personal Care, Home & Garden, Education, Gifts, Travel, Savings, Fees & Charges, Income, Other.

### `statements`

| Column            | Type                    | Notes                                       |
| ----------------- | ----------------------- | ------------------------------------------- |
| id                | integer, PK             | Auto-increment                              |
| uploaded_by       | integer, FK → users     | Who uploaded this                           |
| filename          | text                    | Stored filename on disk                     |
| original_filename | text                    | What the user's file was called             |
| institution       | text, nullable          | "TD", "RBC" — null for now, useful later    |
| period_start      | date, nullable          | First transaction date                      |
| period_end        | date, nullable          | Last transaction date                       |
| raw_text          | text, nullable          | Full extracted text from PDF                |
| created_at        | timestamp               | Default now                                 |

### `transactions`

| Column           | Type                              | Notes                                           |
| ---------------- | --------------------------------- | ----------------------------------------------- |
| id               | integer, PK                       | Auto-increment                                  |
| statement_id     | integer, FK → statements          | Which upload this came from                     |
| date             | date                              | Transaction date                                |
| description      | text                              | Raw text from the bank statement                |
| merchant         | text, nullable                    | Extracted merchant name (parsed from description)|
| amount           | integer                           | **Stored in cents** (see below)                 |
| type             | text                              | "debit" or "credit"                             |
| category_id      | integer, FK → categories, nullable | Null until categorized                         |
| status           | text                              | "needs_review" or "confirmed"                   |
| created_at       | timestamp                         | Default now                                     |

**Why cents?** `19.99 + 0.01` doesn't always equal `20.00` in JavaScript. Store `1999` as an integer, format at display time: `(amount / 100).toFixed(2)`.

**Why a separate merchant column?** The raw `description` from a bank statement is messy — something like "POS PURCHASE - LOBLAWS #4521 TORONTO ON". The `merchant` column stores the cleaned-up name ("Loblaws") extracted during PDF parsing. This enables merchant-level analytics: "How much do we spend at Amazon?" without relying on fuzzy text matching every time.

**Status flow:**
```
Upload → "needs_review" (no category yet)
   ↓
Human picks category → "confirmed"
```

### What's NOT in the schema (and why)

**No `confidence_score` or `categorized_by`** — all categorization is manual. No AI involved.

**No `category_examples` table** — no RAG feedback loop in this project. The AI Brain project handles that if needed.

**No `budgets` or `reports` tables** — this is a tracker, not an analyst. The AI Brain handles analysis.

**No `settings` or `preferences` table** — two users, hardcode what you need.

---

## Cost Estimate

| Item                              | Cost           |
| --------------------------------- | -------------- |
| VPS (already have)                | $0             |
| Everything else is self-hosted    | $0             |
| **Total**                         | **$0/month**   |

No API calls, no AI costs. FinLens is a pure web app.

---

## Key Design Decisions

**Why SQLite over Postgres?**
Two users, low writes, self-hosted. Zero-config, easy backups (copy one file). Drizzle makes switching to Postgres easy if you ever need to.

**Why not a monorepo from day one?**
You don't need one until Phase 2. A monorepo with shared packages is overhead when you're learning Hono and Drizzle. Start simple, restructure when you have a real reason (the MCP server needing shared types).

**Why Tailwind v4?**
v4 uses a CSS-first configuration model — no `tailwind.config.js`. Cleaner setup, and learning the latest version is more future-proof.

**Why shadcn/ui?**
It's not a component library you install — it copies component source code into your project. You own the code, can modify anything, and there's no dependency to worry about. Polished, accessible components without building them from scratch.

**Why Better Auth instead of rolling your own?**
The app is on the public internet with financial data behind it. Secure cookie flags, CSRF protection, rate limiting, session rotation — an auth library handles all of this by default. Better Auth has a Drizzle adapter, is TypeScript-first, and avoids the overhead of OAuth providers you don't need.

**Why manual categorization instead of AI?**
100% accuracy matters with financial data. No confidence scores to worry about, no review queues, no miscategorizations to fix. The categorization UX should be fast enough that manual doesn't feel like a burden.

**Why extract merchants separately?**
Merchants enable a dimension of analysis that categories alone can't provide. "We spent $200 on groceries" is useful. "We spent $120 at Loblaws and $80 at No Frills" is more useful. Extracting merchants during parsing is simple string work — no AI needed.

---

## What "Done" Looks Like

When both phases are complete, you have:

1. A working, self-hosted finance tracker you and your fiancée actually use daily
2. Merchant-level spending insights alongside category breakdowns
3. An MCP server that makes your data conversationally accessible from Claude Desktop
4. A clean foundation that the AI Brain project can connect to

FinLens is practical first, portfolio piece second. It's the data layer that powers everything else.