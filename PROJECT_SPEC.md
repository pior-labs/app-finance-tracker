# FinLens — Personal Finance Tracker with AI Categorization

> A self-hosted personal finance tracker for two users. Upload bank statement PDFs, automatically categorize transactions using RAG, and gain insights through AI-powered agents — all running on a tiny VPS for under $5/month in API costs.

---

## Why This Project Exists

My fiancée and I wanted a simple, private way to track our spending without handing our financial data to a third-party app. We upload our bank statements, the system categorizes every transaction, and over time it learns our patterns. No subscriptions to Mint. No spreadsheets. Just a self-hosted tool that works for us.

From an engineering perspective, this project is a vehicle to demonstrate four core AI engineering competencies — **RAG**, **MCP servers**, **AI agents**, and **agent orchestration** — within a single cohesive system rather than disconnected demos.

---

## Tech Stack

| Layer              | Technology            | Why                                                        |
| ------------------ | --------------------- | ---------------------------------------------------------- |
| Backend API        | Hono (TypeScript)     | Lightweight, web-standards, minimal VPS footprint          |
| Frontend           | React + Vite          | SPA, no SSR needed for a private app, fast builds          |
| Database           | SQLite + Drizzle ORM  | Zero-config, file-based, perfect for low-traffic self-host |
| Vector Store       | Qdrant                | Lightweight, Docker-friendly, good TS client               |
| LLM (high-volume)  | Claude Haiku (API)    | Fast, cheap — handles transaction categorization           |
| LLM (low-volume)   | Claude Sonnet (API)   | Smarter — handles agent reasoning and analysis             |
| PDF Parsing        | pdf-parse / pdfplumber via a TS wrapper | Extract tabular data from statements    |
| Auth               | Simple session-based  | Two users, no need for OAuth complexity                    |
| Deployment         | Docker Compose on VPS | Single command deploy, easy to maintain                    |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React + Vite SPA                    │
│         Upload PDFs · Review transactions · Dashboard   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────┐
│                      Hono API Server                    │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ PDF Parser  │  │  RAG Engine  │  │  Agent Layer  │  │
│  │             │  │              │  │               │  │
│  │ Extract     │  │ Categorize   │  │ Analyze       │  │
│  │ transactions│  │ transactions │  │ trends        │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │          │
│  ┌──────▼────────────────▼───────────────────▼───────┐  │
│  │                   Data Layer                      │  │
│  │     SQLite (transactions, categories, users)      │  │
│  │     Qdrant  (embeddings for RAG)                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    MCP Server (Phase 3)
                           │
              Claude Desktop / Any MCP Client
```

---

## Data Model (Core)

```
users
├── id
├── name
├── email
└── created_at

statements
├── id
├── user_id (FK)
├── filename
├── upload_date
├── institution
├── statement_period_start
├── statement_period_end
└── raw_text (extracted PDF content)

transactions
├── id
├── statement_id (FK)
├── date
├── description (raw text from statement)
├── amount
├── type (debit / credit)
├── category_id (FK, nullable until categorized)
├── confidence_score (0.0 - 1.0)
├── status (auto_categorized | needs_review | confirmed)
├── categorized_by (ai | human)
└── created_at

categories
├── id
├── name (e.g. "Groceries", "Dining Out", "Transport")
├── description (used as RAG context)
├── keywords (common merchant names / patterns)
└── user_defined (boolean)

category_examples
├── id
├── category_id (FK)
├── transaction_description
├── notes
└── source (seed | user_correction)
```

---

## Phased Roadmap

The project is broken into five phases. Each phase is a working, deployable increment. **Do not start a phase until the previous one is solid.** Resist the urge to skip ahead.

---

### Phase 1 — Foundation & PDF Extraction (MVP)

**Goal:** Upload a PDF bank statement, extract transactions, view them in a UI, and manually categorize them.

**This is the most important phase.** If the PDF parsing and data model are wrong, everything built on top will be shaky.

#### Tasks

1. **Project scaffolding**
   - Initialize monorepo structure (`/api`, `/web`, `/shared`)
   - Set up Hono with TypeScript
   - Set up React + Vite
   - Configure Drizzle ORM with SQLite
   - Docker Compose for local dev (API + frontend)

2. **Authentication**
   - Simple email/password auth (bcrypt + session cookies)
   - Two hardcoded user accounts is fine for MVP — registration not needed
   - Middleware to protect API routes

3. **PDF upload & parsing**
   - File upload endpoint (accept PDF, store on disk)
   - Parse your specific bank's statement format
   - Extract: date, description, amount, debit/credit
   - Store raw extracted text + parsed transactions in SQLite
   - **Important:** Write robust tests for the parser with real statement samples. This is the foundation everything else depends on.

4. **Transaction viewer UI**
   - List all transactions, grouped by statement
   - Filter by date range
   - Manual category assignment via dropdown
   - Seed the categories table with ~15-20 common categories

5. **Dockerize & deploy**
   - Docker Compose with API + frontend containers
   - Deploy to VPS
   - Basic HTTPS with Caddy or nginx reverse proxy

#### Definition of Done
- You and your fiancée can upload a statement, see parsed transactions, and manually categorize them.
- Data persists across restarts.
- Accessible from both your devices via HTTPS.

#### Estimated Effort: 2-3 weeks

---

### Phase 2 — RAG-Powered Categorization

**Goal:** Transactions are automatically categorized with a confidence score. Low-confidence items go to a review queue. Corrections feed back into the knowledge base.

#### Tasks

1. **Set up Qdrant**
   - Add Qdrant container to Docker Compose
   - Install Qdrant TypeScript client

2. **Build the knowledge base**
   - Embed category descriptions + keywords into Qdrant
   - Embed all manually-categorized transactions from Phase 1 as examples
   - Use an embedding model (e.g., Anthropic's or OpenAI's embedding endpoint, or a local model like `all-MiniLM-L6-v2` via a small service)

3. **Categorization pipeline**
   - For each new transaction:
     1. Generate embedding of the transaction description
     2. Retrieve top-k similar examples from Qdrant
     3. Send transaction + retrieved context to Claude Haiku
     4. Haiku returns: `{ category, confidence, reasoning }`
   - If confidence ≥ 0.85 → auto-categorize, status = `auto_categorized`
   - If confidence < 0.85 → status = `needs_review`

4. **Review queue UI**
   - Dedicated view showing `needs_review` transactions
   - Show the AI's suggestion + confidence + reasoning
   - User can confirm, change category, or add notes
   - On confirmation: store as a new example in the knowledge base (feedback loop)

5. **Batch processing**
   - When a statement is uploaded, run the full pipeline automatically
   - Show progress (processing → categorized → review needed)

6. **Evaluation & tuning**
   - Track accuracy: what % of auto-categorized items do users override?
   - Adjust confidence threshold based on real usage
   - Log all LLM calls for debugging and cost tracking

#### Definition of Done
- Upload a statement → most transactions auto-categorize correctly.
- Low-confidence items appear in a review queue.
- Correcting a mistake improves future categorization.

#### Estimated Effort: 2-3 weeks

---

### Phase 3 — MCP Server

**Goal:** Expose your finance data as an MCP server so you can query it conversationally from Claude Desktop or any MCP-compatible client.

#### Tasks

1. **MCP server setup**
   - Use the official `@modelcontextprotocol/sdk` TypeScript package
   - Create a standalone MCP server process (can share the database with the API)

2. **Define tools**
   - `get_spending_summary` — total spending by category for a given month
   - `get_transactions` — list transactions with optional filters (category, date range, amount range)
   - `compare_months` — compare spending between two months
   - `get_category_breakdown` — percentage breakdown of spending
   - `get_uncategorized` — list transactions still needing review
   - `search_transactions` — free-text search across transaction descriptions

3. **Define resources**
   - Expose category list as an MCP resource
   - Expose monthly summary as a resource

4. **Test with Claude Desktop**
   - Configure Claude Desktop to connect to your MCP server
   - Test natural language queries: "How much did we spend on groceries last month?"
   - Test comparative queries: "Are we spending more on dining out this month vs last?"

5. **Deploy**
   - Add MCP server to Docker Compose
   - Expose via a secure transport (SSE or stdio depending on your setup)

#### Definition of Done
- You can open Claude Desktop and ask natural language questions about your finances.
- Answers are accurate and pull from real data.

#### Estimated Effort: 1-2 weeks

---

### Phase 4 — Budget Analysis Agent

**Goal:** An AI agent that autonomously analyzes your finances — identifying trends, anomalies, and generating actionable insights.

#### Tasks

1. **Agent framework**
   - Build a simple agent loop (no framework needed — keep it transparent):
     ```
     while not done:
       think about what to do next
       pick a tool and call it
       observe the result
       decide if done or need more info
     ```
   - The agent's tools are your MCP tools (or direct DB access)

2. **Analysis capabilities**
   - **Anomaly detection:** Flag transactions that are unusually large for their category
   - **Trend analysis:** "Grocery spending has increased 23% over the last 3 months"
   - **Budget tracking:** Set simple budget targets per category, agent reports progress
   - **Recurring charge detection:** Identify subscriptions and recurring payments

3. **Trigger mechanisms**
   - On-demand: button in the UI — "Analyze this month"
   - Automated: run after every statement upload
   - Scheduled: weekly or monthly summary (cron job that triggers the agent)

4. **Output**
   - Agent produces a structured report stored in the database
   - UI shows reports with sections: summary, anomalies, trends, recommendations
   - Use Claude Sonnet for this — it needs stronger reasoning than Haiku

#### Definition of Done
- Click "Analyze" and get a meaningful, accurate financial summary.
- Anomalies and trends are genuinely useful, not generic.

#### Estimated Effort: 2-3 weeks

---

### Phase 5 — Multi-Agent Orchestration

**Goal:** Multiple specialized agents collaborate to produce a comprehensive monthly financial review.

#### Tasks

1. **Specialist agents**
   - **Spending Analyst:** Breaks down spending patterns, compares to previous months
   - **Anomaly Detector:** Focuses on unusual charges, potential duplicates, subscriptions you may have forgotten
   - **Budget Advisor:** Evaluates spending against goals, suggests adjustments
   - **Savings Finder:** Identifies areas where spending could be reduced based on patterns

2. **Supervisor agent**
   - Receives the goal: "Produce the monthly financial review for March 2026"
   - Delegates to specialist agents (can run in parallel where possible)
   - Collects outputs, resolves conflicts (e.g., two agents interpret a charge differently)
   - Synthesizes into a unified report with sections from each specialist

3. **Communication protocol**
   - Define how agents pass data to each other
   - Structured output format for each specialist
   - Supervisor has the ability to ask follow-up questions to specialists

4. **Monthly report UI**
   - Rich report view in the dashboard
   - Sections attributed to each specialist
   - Actionable items highlighted
   - Historical comparison: "How does this month's report compare to last month's?"

#### Definition of Done
- End-of-month automated report that covers spending analysis, anomalies, budget tracking, and savings opportunities.
- The system handles disagreements between agents gracefully.
- Reports are genuinely useful for making financial decisions.

#### Estimated Effort: 2-4 weeks

---

## Project Structure

```
finlens/
├── docker-compose.yml
├── packages/
│   ├── api/                  # Hono backend
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   │   ├── pdf-parser.ts
│   │   │   │   ├── categorizer.ts
│   │   │   │   ├── rag-engine.ts
│   │   │   │   └── agent.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   └── migrations/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/                  # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── mcp-server/           # MCP server (Phase 3)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── tools/
│   │   └── package.json
│   └── shared/               # Shared types & utilities
│       ├── src/
│       │   └── types.ts
│       └── package.json
├── data/                     # SQLite DB + uploaded PDFs (gitignored)
├── PROJECT_SPEC.md
└── README.md
```

---

## Cost Estimate (Monthly)

| Item                              | Estimated Cost |
| --------------------------------- | -------------- |
| VPS (already have)                | $0             |
| Claude Haiku — categorization     | ~$0.50         |
| Claude Sonnet — agent analysis    | ~$1-2          |
| Embedding model (if using API)    | ~$0.10         |
| Qdrant (self-hosted)              | $0             |
| **Total**                         | **~$2-3/month** |

---

## Key Design Decisions

**Why SQLite over Postgres?**
Two users, low write volume, self-hosted on a small VPS. SQLite is zero-config, single-file, easy to back up (just copy the file), and more than capable for this workload. If you ever outgrow it, Drizzle ORM makes the switch to Postgres straightforward.

**Why Qdrant over Chroma?**
Qdrant has a cleaner TypeScript client, better documentation, and runs well in Docker with low resource usage. Chroma is fine too — this is a low-stakes choice at this scale.

**Why a confidence threshold instead of always auto-categorizing?**
Trust matters with financial data. A system that confidently miscategorizes transactions is worse than one that says "I'm not sure — can you check this?" The review queue is a feature, not a compromise.

**Why Haiku for categorization and Sonnet for agents?**
Categorizing a transaction into a known set of categories is a simple, well-scoped task — Haiku handles it easily and cheaply. Agent reasoning (planning, multi-step analysis, drawing conclusions) benefits from a stronger model. This tiered approach keeps costs low while maintaining quality where it matters.

**Why not use LangChain or LlamaIndex?**
For a portfolio project, building the RAG pipeline and agent loop from scratch demonstrates deeper understanding than wrapping a framework. Interviewers want to see that you understand retrieval, embedding, prompt construction, and agentic loops — not that you can call `chain.run()`. Keep dependencies minimal and own your abstractions.

---

## What "Done" Looks Like

When all five phases are complete, you have:

1. A working, self-hosted finance tracker you and your fiancée actually use daily
2. A RAG pipeline with a feedback loop that improves over time
3. An MCP server that makes your data conversationally accessible
4. An autonomous agent that produces genuine financial insights
5. A multi-agent system that collaborates on complex analysis
6. A portfolio project that coherently demonstrates all four AI engineering competencies

The project tells a story: you identified a real problem, solved it incrementally, and layered in increasingly sophisticated AI capabilities — each one justified by an actual need, not bolted on for show.
