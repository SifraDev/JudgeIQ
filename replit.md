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

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (Firecrawl webhook)
│   └── judge-iq/           # React+Vite frontend (JudgeIQ)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## JudgeIQ Application

**Purpose**: Hackathon project (ElevenHacks) — voice-powered judicial research tool. Lawyers speak a judge's name to an ElevenAgents conversational AI, which calls a backend webhook that searches Justia, CourtListener, and Ballotpedia via Firecrawl.

### Architecture

- **Backend** (`artifacts/api-server`): Pure Firecrawl passthrough webhook at `POST /api/firecrawl/search`. No LLM on backend — ElevenAgents is the reasoning brain.
- **Frontend** (`artifacts/judge-iq`): React+Vite app with animated orb, system logs terminal, dev toggles, citations panel, and PDF export.
- **ElevenAgents Integration** (`src/hooks/useElevenLabs.ts`): Dormant Phase 3 hook using `@elevenlabs/react`. Activated by setting `VITE_ELEVENLABS_AGENT_ID` env var. Registers `firecrawl_search` as a client tool.

### 3-Phase Build Plan

1. **Phase 1**: Backend webhook + DevConsole for silent text-based testing (completed)
2. **Phase 2**: Mocked UI states via DevStateToggle panel (completed)
3. **Phase 3**: Real ElevenAgents voice integration — dormant behind `VITE_ELEVENLABS_AGENT_ID` toggle

### Key Frontend Components

- `Orb.tsx` — Animated voice orb with 4 states: IDLE, LISTENING, PROCESSING, SPEAKING
- `SystemLogs.tsx` — Real-time log terminal (auto-scrolling, color-coded)
- `DevStateToggle.tsx` — Phase 2 state simulation panel (top-right)
- `DevConsole.tsx` — Phase 1 manual webhook testing (bottom bar)
- `Citations.tsx` — Grid of source citations from Firecrawl results
- `VoiceStateContext.tsx` — Central state machine for voice states + logs
- `useElevenLabs.ts` — Phase 3 dormant hook wrapping `@elevenlabs/react`

### UI Design

- Dark professional theme: Navy (#0A0E1A), Slate, Gold (#D4AF37)
- Fonts: Cinzel (headings), Plus Jakarta Sans (body), JetBrains Mono (terminal)
- Glassmorphism panels with `glass-panel` utility class
- Custom Button with `glass` variant

### Environment Variables

- `FIRECRAWL_API_KEY` — Required for backend Firecrawl searches (set)
- `VITE_ELEVENLABS_AGENT_ID` — Optional; enables Phase 3 real voice (not set yet)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/firecrawl.ts` exposes `POST /firecrawl/search` (full path: `/api/firecrawl/search`)
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@mendable/firecrawl-js`

### `artifacts/judge-iq` (`@workspace/judge-iq`)

React+Vite frontend for JudgeIQ. Uses Tailwind CSS v4, Framer Motion, Lucide icons, html2pdf.js for PDF export.

- Entry: `src/main.tsx` → `App.tsx` → `pages/Home.tsx`
- Key deps: `@elevenlabs/react` (dormant), `@workspace/api-client-react`, `framer-motion`, `html2pdf.js`
- Custom `Button.tsx` at `src/components/ui/Button.tsx` with `glass` variant (not shadcn default)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useFirecrawlSearch`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
