# FinLens — Personal Finance Tracker with AI Categorization

> A self-hosted personal finance tracker for two users. Upload bank statement PDFs, automatically categorize transactions using RAG, and gain insights through AI-powered agents — all running on a tiny VPS for under $5/month in API costs.

---

## Why This Project Exists

My fiancée and I wanted a simple, private way to track our spending without handing our financial data to a third-party app. We upload our bank statements, the system categorizes every transaction, and over time it learns our patterns. No subscriptions to Mint. No spreadsheets. Just a self-hosted tool that works for us.

From an engineering perspective, this project is a vehicle to demonstrate four core AI engineering competencies — **RAG**, **MCP servers**, **AI agents**, and **agent orchestration** — within a single cohesive system rather than disconnected demos.

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
| Qdrant                | Phase 2       | Vector store for RAG embeddings                            |
| Claude Haiku (API)    | Phase 2       | Fast, cheap LLM for transaction categorization             |
| MCP TypeScript SDK    | Phase 3       | Expose finance data as an MCP server                       |
| Claude Sonnet (API)   | Phase 4       | Smarter LLM for agent reasoning and analysis               |

---

## How This Project Grows

Each phase is a working, deployable app. The project structure starts simple and gets more complex only when the complexity is justified. **You scaffold each phase when you start it, not before.**

```
Phase 1:  finlens/
          ├── api/          ← Hono server, Drizzle, PDF parsing
          ├── web/          ← React + Vite + Tailwind v4 + shadcn
          ├── docs/         ← Project specs and phase plans
          └── docker-compose.yml

Phase 2:  (add to existing)
          ├── api/
          │   └── src/services/rag/   ← RAG pipeline added here
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

**Do not start a phase until the previous one is solid.** Each phase gets its own detailed execution plan (like the Phase 1 plan) when you're ready to start it.

---

### Phase 1 — Foundation & Manual Categorization

**AI Engineering Skill:** None — this is pure web dev. Build the foundation right.

**What it does:** Upload a PDF bank statement, extract transactions, view them in a shared household dashboard, and manually categorize them.

**What you'll learn:** Hono, Drizzle ORM, Tailwind v4, shadcn/ui, PDF parsing, Docker Compose, deploying to a VPS.

**What gets installed:**

- hono
- drizzle-orm + better-sqlite3
- bcrypt (auth)
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
│   │   │   ├── schema.ts         # Drizzle schema (5 tables)
│   │   │   ├── seed.ts           # Seed users + categories
│   │   │   └── index.ts          # DB connection
│   │   ├── middleware/
│   │   │   └── auth.ts           # Session auth middleware
│   │   └── lib/
│   │       └── types.ts          # Shared types (for now, local)
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx               # Router setup (4 routes)
│   │   ├── app.css               # Tailwind v4 entry (imports + theme)
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
├── docs/                          # Project specs and phase plans
│   ├── PROJECT_SPEC.md
│   └── PHASE_1_PLAN.md
├── data/                          # gitignored — DB + uploaded PDFs
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

**Definition of Done:**

- You and your fiancée can upload statements, see transactions, and manually categorize them.
- Data is shared between both accounts (household view).
- Deployed to your VPS with HTTPS.
- PDF parser correctly extracts all transactions from your bank's format.

**Estimated Effort:** 2-3 weeks

**Detailed execution plan:** docs/PHASE_1_PLAN.md

---

### Phase 2 — RAG-Powered Categorization

**AI Engineering Skill:** RAG (retrieval-augmented generation)

**What it does:** Transactions are automatically categorized using a RAG pipeline. The system retrieves similar past transactions and category definitions, sends them to an LLM, and gets back a category with a confidence score. Low-confidence items go to a review queue. User corrections feed back into the knowledge base.

**What you'll learn:** Embeddings, vector stores, retrieval pipelines, prompt engineering for structured output, confidence thresholds, feedback loops.

**What gets added:**

- Qdrant container in Docker Compose
- `@qdrant/js-client-rest` package
- `@anthropic-ai/sdk` package
- An embedding model (OpenAI's `text-embedding-3-small` or a local alternative)
- New service files in `api/src/services/rag/`

**What changes in the project:**

```
finlens/
├── api/
│   └── src/
│       └── services/
│           ├── pdf-parser.ts          # unchanged
│           └── rag/                   # NEW
│               ├── embeddings.ts      # Generate embeddings
│               ├── knowledge-base.ts  # Manage Qdrant collections
│               ├── categorizer.ts     # RAG pipeline: retrieve → prompt → classify
│               └── feedback.ts        # Handle user corrections → update KB
├── web/
│   └── src/
│       └── pages/
│           └── Transactions.tsx       # Updated: shows confidence, reasoning, review queue
├── docs/
│   └── PHASE_2_PLAN.md               # NEW: written when you start Phase 2
└── docker-compose.yml                 # Updated: adds Qdrant container
```

**Definition of Done:**

- Upload a statement → most transactions auto-categorize correctly.
- Low-confidence items appear for review with the AI's reasoning shown.
- Correcting a mistake visibly improves future categorization.
- You can track accuracy (% of overrides) and API costs.

**Estimated Effort:** 2-3 weeks

---

### Phase 3 — MCP Server

**AI Engineering Skill:** MCP (Model Context Protocol)

**What it does:** Exposes your finance data as an MCP server. You can open Claude Desktop and ask "How much did we spend on groceries last month?" and get an answer from your real data.

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
├── packages/                          # NEW: monorepo structure
│   ├── api/                          # moved from root
│   ├── web/                          # moved from root
│   ├── mcp-server/                   # NEW
│   │   ├── src/
│   │   │   ├── index.ts             # MCP server entry
│   │   │   └── tools/
│   │   │       ├── spending.ts      # get_spending_summary, compare_months
│   │   │       ├── transactions.ts  # get_transactions, search_transactions
│   │   │       └── categories.ts    # get_category_breakdown
│   │   └── package.json
│   └── shared/                       # NEW: extracted from api/lib/types.ts
│       ├── src/
│       │   └── types.ts
│       └── package.json
├── docs/                              # stays at root
│   └── PHASE_3_PLAN.md               # NEW
├── pnpm-workspace.yaml               # NEW
└── docker-compose.yml                 # Updated: adds MCP server
```

**Definition of Done:**

- Claude Desktop can connect to your MCP server.
- You can ask natural language questions about your finances and get accurate answers.
- The MCP server runs alongside the API in Docker Compose.

**Estimated Effort:** 1-2 weeks

---

### Phase 4 — Budget Analysis Agent

**AI Engineering Skill:** AI Agents

**What it does:** An autonomous agent that analyzes your finances — identifying trends, anomalies, and generating actionable insights. It uses a tool-calling loop: think → pick a tool → observe → decide if done.

**What you'll learn:** Agent loops (built from scratch), tool-calling with LLMs, structured output, prompt engineering for reasoning, Claude Sonnet for complex tasks.

**What gets added:**

- New service files in `api/src/services/agent/`
- New database tables: `budgets`, `reports`
- New UI page or section for viewing agent reports

**What changes in the project:**

```
finlens/
├── packages/api/
│   └── src/
│       └── services/
│           └── agent/                # NEW
│               ├── loop.ts          # The core agent loop
│               ├── tools.ts         # Tools the agent can call (DB queries)
│               └── prompts.ts       # System prompts for analysis
├── packages/web/
│   └── src/
│       └── pages/
│           └── Reports.tsx          # NEW: view agent-generated reports
├── docs/
│   └── PHASE_4_PLAN.md             # NEW
```

**Definition of Done:**

- Click "Analyze this month" and get a meaningful financial summary.
- Anomalies and trends are accurate and useful, not generic.
- Agent uses Sonnet and keeps costs reasonable.

**Estimated Effort:** 2-3 weeks

---

### Phase 5 — Multi-Agent Orchestration

**AI Engineering Skill:** Agent Orchestration

**What it does:** Multiple specialized agents collaborate on a comprehensive monthly financial review. A supervisor agent delegates to specialists (spending analyst, anomaly detector, budget advisor), collects their outputs, and produces a unified report.

**What you'll learn:** Multi-agent patterns, supervisor/worker architecture, parallel execution, conflict resolution between agents, structured communication protocols.

**What gets added:**

- New service files in `api/src/services/orchestrator/`
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
- The system handles disagreements between agents gracefully.
- Reports are useful for making real financial decisions.

**Estimated Effort:** 2-4 weeks

---

## Database Schema

Five tables, created in Phase 1. Some columns won't be used until Phase 2, but creating them now avoids schema changes later.

### `users`

| Column        | Type           | Notes                    |
| ------------- | -------------- | ------------------------ |
| id            | integer, PK    | Auto-increment           |
| name          | text           | Display name             |
| email         | text, unique   | Login identifier         |
| password_hash | text           | bcrypt hash              |
| created_at    | timestamp      | Default now              |

### `categories`

| Column      | Type           | Notes                                                              |
| ----------- | -------------- | ------------------------------------------------------------------ |
| id          | integer, PK    | Auto-increment                                                     |
| name        | text, unique   | "Groceries", "Dining Out", etc.                                    |
| description | text           | "Supermarkets, grocery stores, food staples" — RAG context (Phase 2) |
| keywords    | text           | "Loblaws, Metro, No Frills" — common merchants (Phase 2)          |
| is_default  | boolean        | true for seeded, false for user-created                            |
| created_at  | timestamp      | Default now                                                        |

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
| amount           | integer                           | **Stored in cents** (see below)                 |
| type             | text                              | "debit" or "credit"                             |
| category_id      | integer, FK → categories, nullable | Null until categorized                         |
| confidence_score | real, nullable                    | 0.0–1.0, null for manual. Used in Phase 2      |
| status           | text                              | "needs_review", "auto_categorized", "confirmed" |
| categorized_by   | text, nullable                    | "human" or "ai"                                 |
| created_at       | timestamp                         | Default now                                     |

**Why cents?** `19.99 + 0.01` doesn't always equal `20.00` in JavaScript. Store `1999` as an integer, format at display time: `(amount / 100).toFixed(2)`.

**Status flow:**

```
Upload → "needs_review"
Phase 1:  Human picks category → "confirmed"
Phase 2:  AI categorizes → "auto_categorized" → Human confirms → "confirmed"
```

### `category_examples`

Created in Phase 1, populated starting in Phase 2. Each user correction inserts a row here, building the RAG knowledge base over time.

| Column                  | Type                      | Notes                                          |
| ----------------------- | ------------------------- | ---------------------------------------------- |
| id                      | integer, PK               | Auto-increment                                 |
| category_id             | integer, FK → categories  | What category this belongs to                  |
| transaction_description | text                      | The transaction text                           |
| notes                   | text, nullable            | Optional context                               |
| source                  | text                      | "seed" or "user_correction"                    |
| created_at              | timestamp                 | Default now                                    |

### Tables added in later phases

**Phase 4** adds `budgets` and `reports`. These will be designed when you start Phase 4.

---

## Cost Estimate (Monthly, at full build)

| Item                              | Estimated Cost |
| --------------------------------- | -------------- |
| VPS (already have)                | $0             |
| Claude Haiku — categorization     | ~$0.50         |
| Claude Sonnet — agent analysis    | ~$1-2          |
| Embedding model (API)             | ~$0.10         |
| Qdrant (self-hosted)              | $0             |
| **Total**                         | **~$2-3/month** |

Phase 1 costs $0 in API fees. Phase 2 adds ~$0.50-1/month. Costs only grow as you add phases.

---

## Key Design Decisions

**Why SQLite over Postgres?**
Two users, low writes, self-hosted. Zero-config, easy backups (copy one file). Drizzle makes switching to Postgres easy if you ever need to.

**Why not a monorepo from day one?**
You don't need one until Phase 3. A monorepo with shared packages is overhead when you're learning Hono and Drizzle. Start simple, restructure when you have a real reason (the MCP server needing shared types).

**Why Tailwind v4?**
v4 uses a CSS-first configuration model — no `tailwind.config.js`. Cleaner setup, and learning the latest version is more future-proof.

**Why shadcn/ui?**
It's not a component library you install — it copies component source code into your project. You own the code, can modify anything, and there's no dependency to worry about. It gives you polished, accessible components (dropdowns, tables, cards, buttons) without building them from scratch.

**Why a confidence threshold instead of always auto-categorizing?**
Trust matters with financial data. A system that says "I'm not sure — can you check?" is better than one that silently miscategorizes.

**Why Haiku for categorization and Sonnet for agents?**
Simple task = cheap model. Complex reasoning = smarter model. Tiered approach keeps costs low.

**Why build RAG and agents from scratch instead of using LangChain?**
For the portfolio, demonstrating you understand retrieval, embeddings, prompt construction, and agent loops matters more than knowing a framework's API. Build from scratch first, optionally refactor to LangChain afterward to compare.

---

## What "Done" Looks Like

When all five phases are complete, you have:

1. A working, self-hosted finance tracker you and your fiancée actually use
2. A RAG pipeline with a feedback loop that improves over time
3. An MCP server that makes your data conversationally accessible
4. An autonomous agent that produces genuine financial insights
5. A multi-agent system that collaborates on complex analysis
6. A portfolio project that coherently demonstrates all four AI engineering competencies

The project tells a story: you identified a real problem, solved it incrementally, and layered in increasingly sophisticated AI capabilities — each one justified by an actual need, not bolted on for show.
