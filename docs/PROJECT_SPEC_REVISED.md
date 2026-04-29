# FinLens — Personal Finance Tracker with AI-Powered Q&A

> A self-hosted personal finance tracker for two users. Upload bank statement PDFs, group spending by merchant, and ask natural-language questions like *"how much did we spend on Amazon last month?"* — all running on a tiny VPS for under $5/month in API costs.

---

## Why This Project Exists

My fiancée and I wanted a simple, private way to understand our spending without handing our financial data to a third-party app. We upload our bank statements, the system normalizes transactions by merchant, and a chatbot answers questions about our spending. Over time it learns what's normal for us and flags things that aren't.

From an engineering perspective, this project is a vehicle to demonstrate four core AI engineering competencies — **RAG**, **MCP servers**, **AI agents**, and **agent orchestration** — within a single cohesive system rather than disconnected demos.

### What we're NOT trying to build

- **Pixel-perfect fine-grained categorization.** "$54 on beauty products" requires reading Amazon order details we don't have access to. We don't pretend to do that. "$200 on Amazon" is a useful answer.
- **A replacement for Mint/YNAB.** This is a portfolio project that we also use. Trade-offs lean toward "interesting AI architecture" over "every edge case handled."
- **Real-time bank API integration.** Bank PDFs in, insight out. That's the contract.
- **Reimbursement / refund tracking (for now).** These mostly arrive on chequing accounts, which we don't import yet. Punted to a later phase when chequing support is added.

---

## Tech Stack (Introduced Gradually)

Not everything is installed on day one. Each phase introduces only what it needs.

| Technology            | Introduced in | Why                                                        |
| --------------------- | ------------- | ---------------------------------------------------------- |
| Hono (TypeScript)     | Phase 1       | Lightweight API server, web-standards                      |
| React + Vite          | Phase 1       | SPA frontend, fast builds, static output                   |
| Tailwind CSS v4       | Phase 1       | Utility-first styling, v4 for the latest CSS-first config  |
| shadcn/ui             | Phase 1       | Pre-built accessible components, not a library — you own the code |
| SQLite + Drizzle ORM  | Phase 1       | Zero-config database, file-based, easy backups             |
| Docker Compose        | Phase 1       | Deployment on VPS                                          |
| Qdrant                | Phase 2       | Vector store for transaction embeddings                    |
| OpenAI embeddings     | Phase 2       | `text-embedding-3-small` for transaction vectors           |
| Claude Haiku (API)    | Phase 2       | Query understanding + answer synthesis                     |
| MCP TypeScript SDK    | Phase 3       | Expose Q&A capability as an MCP server                     |
| Claude Sonnet (API)   | Phase 4       | Smarter LLM for agent reasoning and analysis               |

---

## How This Project Grows

Each phase is a working, deployable app. The project structure starts simple and gets more complex only when the complexity is justified. **You scaffold each phase when you start it, not before.**

```
Phase 1:  finlens/
          ├── api/          ← Hono server, Drizzle, PDF parsing, merchant rules
          ├── web/          ← React + Vite + Tailwind v4 + shadcn
          ├── docs/         ← Project specs and phase plans
          └── docker-compose.yml

Phase 2:  (add to existing)
          ├── api/
          │   └── src/services/rag/   ← Hybrid retrieval + Q&A pipeline
          └── docker-compose.yml      ← Qdrant container added

Phase 3:  (convert to monorepo)
          ├── packages/
          │   ├── api/               ← moved here
          │   ├── web/               ← moved here
          │   ├── mcp-server/        ← NEW: standalone MCP server
          │   └── shared/            ← NEW: shared types extracted
          ├── docs/                  ← stays at root
          ├── pnpm-workspace.yaml    ← NEW: monorepo config
          └── docker-compose.yml

Phase 4:  (add to api)
          ├── packages/api/
          │   └── src/services/agent/  ← agent loop added here

Phase 5:  (add to api)
          ├── packages/api/
          │   └── src/services/orchestrator/  ← multi-agent added here
```

**Use pnpm from day one** even though Phase 1 isn't a monorepo yet. This way the conversion in Phase 3 is painless — you just add `pnpm-workspace.yaml` and move folders.

---

## Phased Roadmap

Each phase has: what it does, what gets added to the project, what the folder structure looks like when it's done, and what "done" means.

**Do not start a phase until the previous one is solid.** Each phase gets its own detailed execution plan when you're ready to start it.

---

### Phase 1 — Foundation, Merchants, and Manual Workflow

**AI Engineering Skill:** None — this is pure web dev. Build the foundation right.

**What it does:** Upload a PDF bank statement, extract transactions, normalize each transaction to a merchant via a rules engine, assign a coarse category by default, and let users add notes and confirm everything in a fast review UI.

**What you'll learn:** Hono, Drizzle ORM, Tailwind v4, shadcn/ui, PDF parsing, merchant normalization patterns, Docker Compose, deploying to a VPS.

**Key concept — merchant-first model:**

The primary unit is the **merchant**, not the category. "Amazon" is a merchant. "Discretionary" is a coarse category. We auto-resolve the merchant via a deterministic rules engine (regex patterns over the raw transaction description), and the merchant has a default category. The user can override the category, write a note ("for fiancée's birthday"), or link the transaction to a reimbursement — but they're not asked to sub-categorize $54 of beauty products from a $200 Amazon order. That detail lives in the user's head and (optionally) in the notes field.

**What gets installed:**

- hono
- drizzle-orm + better-sqlite3
- bcrypt (auth)
- pdf-parse (PDF extraction)
- react + react-dom + react-router
- vite
- tailwindcss v4
- shadcn/ui components

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
│   │   │   ├── merchants.ts      # CRUD merchants + rules
│   │   │   └── categories.ts
│   │   ├── services/
│   │   │   ├── pdf-parser.ts     # Bank PDF → raw transactions
│   │   │   └── merchant-resolver.ts  # raw description → merchant via rules
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle schema
│   │   │   ├── seed.ts           # Seed users, categories, starter merchant rules
│   │   │   └── index.ts
│   │   ├── middleware/auth.ts
│   │   └── lib/types.ts
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx               # Router
│   │   ├── app.css               # Tailwind v4 entry
│   │   ├── lib/utils.ts          # cn() helper
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx     # Spending by merchant + category, month view
│   │   │   ├── Transactions.tsx  # Review queue + history
│   │   │   ├── Merchants.tsx     # Manage merchants + rules
│   │   │   └── Upload.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── AppShell.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── MerchantBar.tsx   # Top merchants this month
│   │   │   └── CategoryBar.tsx   # Spending by coarse bucket
│   │   └── hooks/useAuth.ts
│   ├── components.json
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

- You and your fiancée can upload statements, see transactions grouped by merchant, and review them quickly.
- A starter set of merchant rules covers your most common 20-30 merchants out of the box.
- Unmatched descriptions appear in a queue where you create a new merchant rule once and the system applies it retroactively.
- Data is shared between both accounts (household view).
- Deployed to your VPS with HTTPS.

**Estimated Effort:** 2-3 weeks

**Detailed execution plan:** docs/PHASE_1_PLAN.md

---

### Phase 2 — Hybrid RAG Q&A

**AI Engineering Skill:** RAG (retrieval-augmented generation) with hybrid retrieval

**What it does:** A chatbot answers natural-language questions about your spending. *"How much did we spend on Amazon last month?"* — *"Show me anything food-related in March."* — *"What's our biggest recurring subscription?"* As a side effect, new merchants discovered by the system get auto-assigned to a coarse category, which the user can override.

**What you'll learn:** Embeddings, vector stores, **hybrid retrieval** (SQL + semantic), query understanding with LLMs, prompt engineering for structured output, answer synthesis with citations, prompt caching.

**What gets added:**

- Qdrant container in Docker Compose
- `@qdrant/js-client-rest` package
- `@anthropic-ai/sdk` package
- An embedding model (`text-embedding-3-small` via OpenAI API)
- New service files in `api/src/services/rag/`
- A chat UI in the web app

**What changes in the project:**

```
finlens/
├── api/
│   └── src/
│       ├── services/
│       │   ├── pdf-parser.ts
│       │   ├── merchant-resolver.ts
│       │   └── rag/                       # NEW
│       │       ├── embeddings.ts          # Generate embeddings for transactions
│       │       ├── vector-store.ts        # Qdrant client wrapper
│       │       ├── query-understanding.ts # NL question → structured query
│       │       ├── retrieval.ts           # Hybrid: SQL + vector search
│       │       ├── answer-synthesis.ts    # Retrieved data → NL answer
│       │       └── auto-classify.ts       # New merchant → coarse category
│       └── routes/
│           └── chat.ts                    # POST /api/chat — Q&A endpoint
├── web/
│   └── src/
│       └── pages/
│           ├── Chat.tsx                   # NEW: ask questions
│           └── Transactions.tsx           # Updated: shows confidence on auto-classified
├── docs/
│   └── PHASE_2_PLAN.md                   # NEW
└── docker-compose.yml                     # Updated: adds Qdrant
```

**Definition of Done:**

- Type *"How much did we spend at Amazon last month?"* — get an accurate answer with the underlying transactions cited.
- Type *"What did we spend on food in March?"* — semantic retrieval pulls Loblaws, Uber Eats, Tim Hortons, etc. without you predefining a "food" tag.
- New merchants get auto-classified to one of the 6-7 coarse buckets with reasonable accuracy (you correct as needed).
- API costs stay under $1/month.
- Prompt caching is wired up for the system prompt to keep latency and costs down.

**Estimated Effort:** 2-3 weeks

---

### Phase 3 — MCP Server

**AI Engineering Skill:** MCP (Model Context Protocol)

**What it does:** Exposes your finance Q&A as an MCP server. Open Claude Desktop, ask *"how much did we spend on groceries last month?"*, and get an answer from your real data — using the same hybrid retrieval pipeline as the in-app chatbot.

**What you'll learn:** MCP protocol, tool design, resource definitions, the MCP TypeScript SDK, monorepo setup.

**What gets added:**

- `@modelcontextprotocol/sdk` package
- A new `mcp-server` package
- Convert the project to a pnpm monorepo (move `api/` and `web/` into `packages/`)
- Extract shared types into a `shared` package

**Why the monorepo conversion happens now:** The MCP server is a separate process that shares types and database access with the API. That's the first time you genuinely need multiple packages.

**What changes in the project:**

```
finlens/
├── packages/                          # NEW: monorepo structure
│   ├── api/                          # moved from root
│   ├── web/                          # moved from root
│   ├── mcp-server/                   # NEW
│   │   ├── src/
│   │   │   ├── index.ts             # MCP server entry
│   │   │   └── tools/
│   │   │       ├── ask.ts           # ask_finlens(question) — full Q&A pipeline
│   │   │       ├── transactions.ts  # get_transactions, search_transactions
│   │   │       ├── merchants.ts     # get_merchant_summary, top_merchants
│   │   │       └── spending.ts      # spending_by_category, compare_months
│   │   └── package.json
│   └── shared/                       # NEW: extracted types
│       ├── src/types.ts
│       └── package.json
├── docs/
│   └── PHASE_3_PLAN.md               # NEW
├── pnpm-workspace.yaml               # NEW
└── docker-compose.yml                 # Updated: adds MCP server
```

**Definition of Done:**

- Claude Desktop connects to your MCP server.
- The same questions that work in the in-app chat work in Claude Desktop.
- The MCP server runs alongside the API in Docker Compose.

**Estimated Effort:** 1-2 weeks

---

### Phase 4 — Splurge Detector & Insight Agent

**AI Engineering Skill:** AI Agents

**What it does:** An autonomous agent answers higher-order questions: *"Did we splurge in March?"*, *"What's trending in our spending?"*, *"What's unusual this month?"* It uses a tool-calling loop on top of the Phase 2/3 retrieval primitives — querying spending baselines, identifying outliers, comparing months, and producing a concise narrative.

**What you'll learn:** Agent loops (built from scratch), tool-calling with LLMs, structured output, prompt engineering for reasoning, Claude Sonnet for complex tasks, anomaly detection patterns.

**What gets added:**

- New service files in `packages/api/src/services/agent/`
- New database tables: `budgets`, `reports`, `baselines`
- New UI page or section for viewing agent reports

**What changes in the project:**

```
finlens/
├── packages/api/
│   └── src/
│       └── services/
│           └── agent/                # NEW
│               ├── loop.ts          # The core agent loop
│               ├── tools.ts         # Tools the agent can call (RAG + DB queries)
│               └── prompts.ts       # System prompts for analysis
├── packages/web/
│   └── src/
│       └── pages/
│           └── Reports.tsx          # NEW: agent-generated reports
├── docs/
│   └── PHASE_4_PLAN.md             # NEW
```

**Definition of Done:**

- Click *"Analyze this month"* and get a meaningful financial summary, not generic platitudes.
- The agent can answer *"Did we splurge?"* by comparing this month to your baseline at the merchant level and flagging specific outliers.
- Anomalies are accurate (false positives stay low) and useful.
- Agent uses Sonnet, with Haiku for cheaper sub-steps where possible. Costs stay reasonable.

**Estimated Effort:** 2-3 weeks

---

### Phase 5 — Multi-Agent Monthly Review

**AI Engineering Skill:** Agent Orchestration

**What it does:** Multiple specialized agents collaborate on a comprehensive monthly financial review. A supervisor agent delegates to specialists (spending analyst, anomaly detector, budget advisor), collects their outputs, and produces a unified report.

**What you'll learn:** Multi-agent patterns, supervisor/worker architecture, parallel execution, conflict resolution between agents, structured communication protocols.

**What gets added:**

- New service files in `packages/api/src/services/orchestrator/`
- Extended report UI with sections from each specialist

**What changes in the project:**

```
finlens/
├── packages/api/
│   └── src/
│       └── services/
│           ├── agent/                     # from Phase 4
│           └── orchestrator/              # NEW
│               ├── supervisor.ts         # Orchestrates specialists
│               ├── specialists/
│               │   ├── spending-analyst.ts
│               │   ├── anomaly-detector.ts
│               │   └── budget-advisor.ts
│               └── report-builder.ts     # Synthesizes final report
├── docs/
│   └── PHASE_5_PLAN.md                   # NEW
```

**Definition of Done:**

- End-of-month automated report covering spending analysis, anomalies, and budget tracking.
- Specialists run in parallel where possible.
- The system handles disagreements between agents gracefully.
- Reports are useful for making real financial decisions.

**Estimated Effort:** 2-4 weeks

---

## How RAG Works in FinLens

This is the centerpiece of Phase 2 and the foundation for Phases 3-5. It's worth describing concretely because it shapes everything downstream.

### The pipeline at a glance

```
User question → Query understanding (LLM) → Hybrid retrieval (SQL + vectors)
              → Answer synthesis (LLM with cited transactions) → Response
```

It's **hybrid retrieval**: structured filters do most of the work, semantic search handles fuzzy queries, and the LLM produces a natural-language answer with cited transactions.

### Example 1: a structured question

> *"How much did we spend on Amazon last month?"*

1. **Query understanding (Haiku):** the LLM converts your question into a structured query.
   ```json
   {
     "intent": "aggregate_spending",
     "merchant": "Amazon",
     "time_range": { "start": "2026-03-01", "end": "2026-03-31" },
     "aggregation": "sum"
   }
   ```
2. **Structured retrieval (SQL):** run the aggregation against the database. Returns 12 transactions and a sum.
3. **Answer synthesis (Haiku):**
   > *"You spent $342.18 on Amazon in March across 12 transactions. The largest was $89.00 on March 14 (note: 'ergonomic keyboard')."*

The answer cites real transactions; the UI lets you click through to inspect them.

### Example 2: a fuzzy / semantic question

> *"Show me anything food-related last month."*

1. **Query understanding:** intent = `semantic_search`, query = "food-related", time range derived.
2. **Hybrid retrieval:**
   - **Structured:** filter transactions by date range.
   - **Semantic:** vector search over transaction embeddings — pulls "Loblaws", "Tim Hortons", "Uber Eats", "Skip the Dishes" without you having to define a "food" tag.
3. **Answer synthesis:** the LLM groups results by merchant and presents totals.

### Example 3: an analytical question (Phase 4)

> *"Did we splurge in March?"*

This routes to the **agent** (Phase 4), not just RAG. But the agent uses RAG as a *tool*: it retrieves baseline spending, retrieves March transactions, identifies outliers at the merchant level, and narrates the result. RAG is one tool in the agent's toolbox.

### What gets embedded?

A vector store entry per transaction:

```
text:     "{normalized_merchant}: {raw_description} — {notes_if_any}"
metadata: { id, date, amount, merchant, category, statement_id }
```

The embedding captures the semantic content. Filters (dates, amounts, merchants) operate on metadata, not embeddings.

### Why hybrid, not pure RAG?

Pure vector RAG over financial data would be wrong. *"What did we spend in March?"* is a SQL query, not a similarity search. Forcing it through embeddings would lose precision and waste tokens. Each tool earns its keep:

- **SQL** for aggregations, date ranges, exact merchant matches.
- **Vectors** for fuzzy concept retrieval ("food-related", "subscription-like").
- **LLM** for query understanding and natural-language answer phrasing.

This *is* RAG — retrieval-augmented generation — but the "retrieval" is hybrid by design. That's a more honest and more interesting portfolio piece than "embed everything and pray."

### What feeds back into the system?

- When you correct a merchant rule, future statements pick it up automatically.
- When you correct a coarse-category assignment, the system updates the merchant's default and re-classifies past transactions from that merchant (with your confirmation).
- When you add a note to a transaction, the note becomes part of its embedding text, so the chatbot can find it later (*"that birthday gift I bought in March"*).

---

## Database Schema

Tables created in Phase 1. Some columns won't be used until Phase 2, but creating them now avoids schema changes later.

### `users`

| Column        | Type           | Notes                    |
| ------------- | -------------- | ------------------------ |
| id            | integer, PK    | Auto-increment           |
| name          | text           | Display name             |
| email         | text, unique   | Login identifier         |
| password_hash | text           | bcrypt hash              |
| created_at    | timestamp      | Default now              |

### `categories` (coarse buckets)

| Column      | Type           | Notes                                                   |
| ----------- | -------------- | ------------------------------------------------------- |
| id          | integer, PK    | Auto-increment                                          |
| name        | text, unique   | "Essentials", "Discretionary", etc.                     |
| description | text           | Used as RAG context in Phase 2 (auto-classification)    |
| is_default  | boolean        | true for seeded, false for user-created                 |
| created_at  | timestamp      | Default now                                             |

**Seed buckets (intentionally coarse):**

- **Essentials** — Groceries, rent/mortgage, utilities, transport, healthcare, insurance
- **Discretionary** — Dining, shopping, entertainment, personal care
- **Subscriptions** — Recurring fixed-amount services (streaming, software, gym)
- **Income** — Salary, freelance, employer refunds (rare on credit card statements)
- **Transfers** — Payments to the card, between own accounts; not real spending
- **Other** — Catch-all

The user can split a bucket later if they want finer detail (e.g., adding "Dining" as its own top-level), but the system never asks them to.

### `merchants`

| Column              | Type                              | Notes                                                |
| ------------------- | --------------------------------- | ---------------------------------------------------- |
| id                  | integer, PK                       | Auto-increment                                       |
| name                | text, unique                      | "Amazon", "Uber Eats", "Loblaws"                     |
| default_category_id | integer, FK → categories          | Default bucket for this merchant                     |
| notes               | text, nullable                    | Free-form notes about the merchant                   |
| created_at          | timestamp                         | Default now                                          |

### `merchant_rules`

Patterns that map raw transaction descriptions to merchants. Applied at parse time. User-editable.

| Column         | Type                          | Notes                                                  |
| -------------- | ----------------------------- | ------------------------------------------------------ |
| id             | integer, PK                   | Auto-increment                                         |
| pattern        | text                          | Regex or substring (e.g., `AMZN|AMAZON.*`)             |
| merchant_id    | integer, FK → merchants       | What merchant this rule resolves to                    |
| priority       | integer                       | Lower number = checked first                           |
| created_at     | timestamp                     | Default now                                            |

### `statements`

| Column            | Type                    | Notes                                       |
| ----------------- | ----------------------- | ------------------------------------------- |
| id                | integer, PK             | Auto-increment                              |
| uploaded_by       | integer, FK → users     | Who uploaded this                           |
| filename          | text                    | Stored filename on disk                     |
| original_filename | text                    | What the user's file was called             |
| institution       | text, nullable          | "TD", "RBC"                                 |
| period_start      | date, nullable          | First transaction date                      |
| period_end        | date, nullable          | Last transaction date                       |
| raw_text          | text, nullable          | Full extracted text from PDF                |
| created_at        | timestamp               | Default now                                 |

### `transactions`

| Column                | Type                                  | Notes                                                  |
| --------------------- | ------------------------------------- | ------------------------------------------------------ |
| id                    | integer, PK                           | Auto-increment                                         |
| statement_id          | integer, FK → statements              | Which upload this came from                            |
| date                  | date                                  | Transaction date                                       |
| description           | text                                  | Raw text from the bank statement                       |
| amount                | integer                               | **Stored in cents** (see below)                        |
| type                  | text                                  | "debit" or "credit"                                    |
| merchant_id           | integer, FK → merchants, nullable     | Resolved by rules engine; null if unmatched            |
| category_id           | integer, FK → categories, nullable    | Defaults from merchant; user can override              |
| notes                 | text, nullable                        | User-supplied notes; included in Phase 2 embeddings    |
| confidence_score      | real, nullable                        | Used by Phase 2 auto-classification of new merchants   |
| status                | text                                  | "needs_review", "auto_resolved", "confirmed"           |
| categorized_by        | text, nullable                        | "human", "rule", or "ai"                               |
| created_at            | timestamp                             | Default now                                            |

**Why cents?** `19.99 + 0.01` doesn't always equal `20.00` in JavaScript. Store `1999` as an integer, format at display time: `(amount / 100).toFixed(2)`.

**Status flow (Phase 1):**

```
Upload → merchant_resolver runs:
  - Rule matched     → status = "auto_resolved", categorized_by = "rule"
  - No rule matched  → status = "needs_review", categorized_by = null
User reviews → status = "confirmed"
```

**Status flow (Phase 2 adds):**

```
New merchant created → Phase 2 auto-classifier picks a default category
                     → status = "auto_resolved", categorized_by = "ai"
User confirms or overrides → status = "confirmed"
```

### Tables added in later phases

**Phase 4** adds `budgets`, `reports`, and `baselines` (for splurge detection). Designed when you start Phase 4.

**Future (chequing import)** adds reimbursement / refund linking. When chequing accounts come in, we'll add a `linked_transaction_id` column on `transactions` (self-FK) so refunds and inter-account transfers can be paired and netted in totals. Skipped for now since credit card statements rarely have these.

---

## Cost Estimate (Monthly, at full build)

| Item                                          | Estimated Cost  |
| --------------------------------------------- | --------------- |
| VPS (already have)                            | $0              |
| Claude Haiku — Q&A query understanding/synth  | ~$0.30          |
| Claude Haiku — new merchant auto-classify     | ~$0.05          |
| Claude Sonnet — agent analysis (Phase 4+)     | ~$1-2           |
| OpenAI embeddings — `text-embedding-3-small`  | ~$0.05          |
| Qdrant (self-hosted)                          | $0              |
| **Total**                                     | **~$1.50-2.50** |

Phase 1 costs $0 in API fees. Phase 2 adds ~$0.40/month. Costs only grow as you add phases.

---

## Key Design Decisions

**Why merchant-first, not category-first?**
Categorization at the "$54 of beauty products" level requires data we don't have access to from a bank PDF. Merchant-level grouping ("$200 at Amazon") is achievable with deterministic rules and is what we actually want to know. Categories become a thin coarse rollup on top, not the central organizing concept.

**Why coarse categories (6-7) instead of fine ones (15-20)?**
The fine-grained version sounds richer but quietly fails: the system is wrong often enough that you stop trusting it, and the corrections become tedious. Coarse buckets are easier to assign correctly, easier for the LLM to reason about in Phase 4, and still answer the questions we actually ask of the data.

**Why hybrid retrieval (SQL + vectors) instead of pure vector RAG?**
Most finance Q&A is structured — date ranges, exact merchant matches, sums. Forcing those through embeddings would lose precision. Vectors earn their keep on fuzzy semantic queries ("food-related", "subscription-like"). Using each tool for what it's good at is the right answer, and it's a more interesting portfolio piece than naive RAG.

**Why SQLite over Postgres?**
Two users, low writes, self-hosted. Zero-config, easy backups (copy one file). Drizzle makes switching to Postgres easy if you ever need to.

**Why not a monorepo from day one?**
You don't need one until Phase 3. A monorepo with shared packages is overhead when you're learning Hono and Drizzle. Start simple, restructure when you have a real reason (the MCP server needing shared types).

**Why Tailwind v4?**
v4 uses a CSS-first configuration model — no `tailwind.config.js`. Cleaner setup, and learning the latest version is more future-proof.

**Why shadcn/ui?**
It's not a component library you install — it copies component source code into your project. You own the code, can modify anything, and there's no dependency to worry about.

**Why a confidence threshold for new-merchant auto-classification?**
Trust matters with financial data. A system that says *"I'm 60% sure this is Discretionary — can you check?"* is better than one that silently miscategorizes.

**Why Haiku for Q&A and Sonnet for agents?**
Q&A is a constrained task with a clear input/output shape — Haiku handles it cheaply. Agent reasoning is open-ended and benefits from the smarter model. Tiered approach keeps costs low.

**Why build RAG and agents from scratch instead of using LangChain?**
For the portfolio, demonstrating you understand retrieval, embeddings, prompt construction, and agent loops matters more than knowing a framework's API. Build from scratch first, optionally refactor afterward.

---

## What "Done" Looks Like

When all five phases are complete, you have:

1. A working, self-hosted finance tracker you and your fiancée actually use.
2. A merchant-first transaction model that gets out of your way.
3. A hybrid RAG pipeline that answers natural-language questions about your spending with cited transactions.
4. An MCP server that exposes the same Q&A capability to Claude Desktop.
5. An autonomous agent that produces genuine financial insights ("did we splurge?").
6. A multi-agent system that collaborates on monthly reviews.
7. A portfolio project that coherently demonstrates all four AI engineering competencies.

The project tells a story: you identified a real problem, made a deliberate scope choice (merchant-first, not category-first), solved it incrementally, and layered in increasingly sophisticated AI capabilities — each one justified by an actual need, not bolted on for show.
