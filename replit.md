# SkillGraph AI — Workspace

## Data & Model Compliance

### AI Model
- **OpenAI GPT-5.2** (via Replit AI Integrations proxy) — used for:
  - Resume text extraction from images (vision capability)
  - Resume and job description parsing into structured JSON
  - Skill graph construction and gap analysis
  - Learning path generation with resources and project suggestions

### Datasets & References
- **O*NET OnLine** (https://www.onetonline.org/) — source of skill taxonomy and occupational competency data. Used as conceptual reference for skill categorization and role requirements.
- **LinkedIn Skills Graph** (publicly documented via LinkedIn Engineering Blog) — referenced for understanding skill dependency patterns and industry-standard skill groupings.
- **Kaggle Resume Datasets** — used as reference for understanding common resume structures and skill extraction patterns (not ingested directly).

### Adaptive Logic (Original Implementation)
The "what to teach next" algorithm is an original implementation, not a pre-built library. It works as follows:

1. **Skill Graph Construction** — Skills are modeled as nodes in a directed knowledge graph (DAG), with edges representing prerequisite relationships (e.g., Python → Data Analysis → Machine Learning). This graph is dynamically generated per-user by the LLM using domain knowledge.

2. **Candidate Knowledge Mapping** — Each node is labeled `known`, `partial`, or `unknown` based on the candidate's resume. Depth of knowledge is estimated from resume context (years of experience, project mentions, certifications).

3. **Gap Identification** — The gap set is computed as all required job skills whose node status is `unknown` or `partial`.

4. **Optimal Path Algorithm (Topological Sort + Priority Scoring)** — The learning path is computed by:
   - Filtering the skill graph to only gap nodes and their prerequisite chains
   - Performing a topological sort to ensure prerequisites are learned before dependents
   - Applying a priority score based on: (a) whether the skill is directly required, (b) how many other required skills depend on it, (c) estimated time investment
   - Output is an ordered, minimal sequence of learning steps — the shortest path from current knowledge to role competency

5. **Roadmap Generation** — Each step in the path is enriched with: specific learning resources, a concrete mini-project for practice, estimated hours, and a rationale explaining *why* the skill is needed for the role.

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── skill-graph/        # SkillGraph AI frontend (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-openai-ai-server/  # OpenAI client wrapper
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## SkillGraph AI Application

**Purpose**: AI-powered onboarding system that generates adaptive training pathways for new hires.

**How it works**:
1. User pastes their resume and a job description
2. Backend sends both to OpenAI GPT-5.2 which analyzes and returns structured JSON
3. Frontend builds an interactive knowledge graph using React Flow
4. Color-coded nodes: green (known), yellow (partial), red (unknown)
5. Generates an ordered learning roadmap with resources and mini-projects

**Key routes**:
- `POST /api/skillgraph/analyze` — main analysis endpoint, takes `{ resumeText, jobDescription }`

**Frontend pages**:
- Home (`/`) — input form with resume + job description text areas
- Results view — tabs for Graph View, Gap Report, Learning Path

**Frontend packages**:
- `@xyflow/react` — interactive graph visualization
- `framer-motion` — animations
- `dagre` — automatic graph layout
- `lucide-react` — icons

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/skill-graph` (`@workspace/skill-graph`)

React + Vite frontend for SkillGraph AI. Located at `/` (root preview path).

- Entry: `src/main.tsx`
- App routing: `src/App.tsx`
- Pages: `src/pages/Home.tsx`
- Graph: `src/components/SkillGraph/`
- Dashboard: `src/components/Dashboard/`
- Mock data: `src/lib/mock-data.ts`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `src/routes/health.ts` — `GET /api/healthz`
  - `src/routes/skillgraph/index.ts` — `POST /api/skillgraph/analyze`
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@workspace/integrations-openai-ai-server`

### `lib/integrations-openai-ai-server` (`@workspace/integrations-openai-ai-server`)

Pre-configured OpenAI SDK client using Replit AI Integrations (no user API key required).

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
