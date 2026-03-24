# JudgeIQ

**Voice-powered judicial intelligence.**

> Built for [ElevenHacks](https://elevenlabs.io) — combining **ElevenLabs Conversational AI** + **Firecrawl** to give lawyers instant, voice-driven judicial profiles.

---

## What is JudgeIQ?

JudgeIQ lets lawyers **speak a judge's name** and receive a comprehensive judicial profile — narrated by AI — in seconds. The system scrapes legal databases in real time, synthesizes the data through GPT-4o, and delivers the findings through an ElevenLabs conversational agent that can answer follow-up questions.

No typing. No searching. Just ask.

---

## How It Works

```
 ┌─────────────────┐     ┌─────────────────────┐     ┌────────────────────┐
 │   User speaks    │────▶│  ElevenLabs Agent    │────▶│  Backend Webhook   │
 │  a judge's name  │     │  (Conversational AI) │     │  /api/research     │
 └─────────────────┘     └─────────────────────┘     └────────┬───────────┘
                                                              │
                          ┌───────────────────────────────────┘
                          ▼
              ┌──────────────────────┐
              │   Firecrawl Search   │
              │  • justia.com        │
              │  • courtlistener.com │
              │  • ballotpedia.org   │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   OpenAI GPT-4o-mini │
              │  Synthesizes:        │
              │  • Executive Summary │
              │  • 6-8 Tendencies    │
              │  • 4-6 Biases        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Agent Narrates     │
              │   Profile via Voice  │
              │   + Visual Dashboard │
              └──────────────────────┘
```

**Step by step:**

1. User taps the orb and speaks a judge's name
2. ElevenLabs Conversational AI recognizes the name and triggers the `firecrawl_search` tool
3. Backend searches Justia, CourtListener, and Ballotpedia via Firecrawl
4. Raw legal data is sent to GPT-4o-mini for structured synthesis
5. The agent narrates the executive summary while the dashboard displays tendencies, biases, and source citations
6. Research context is injected back into the agent, enabling follow-up Q&A about the judge

---

## Features

- **Voice-First Interface** — Speak naturally to research any judge. No forms, no search bars.
- **Real-Time Web Scraping** — Firecrawl searches across 3 major legal databases simultaneously.
- **AI Synthesis** — GPT-4o-mini produces structured judicial profiles with tendencies and biases.
- **Conversational Follow-Up** — Ask follow-up questions and the agent responds with context from the research.
- **Cinematic UX** — Three-state visual flow with animated orb, processing indicators, and glassmorphism panels.
- **PDF Export** — Download the judicial brief as a formatted PDF with one click.
- **Source Citations** — Every profile includes clickable citations from the original legal sources.

---

## Screenshots

> *Add your screenshots here*

| Idle State | Processing | Results Dashboard |
|:---:|:---:|:---:|
| ![Idle](screenshots/idle.png) | ![Processing](screenshots/processing.png) | ![Results](screenshots/results.png) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Voice AI** | [ElevenLabs Conversational AI](https://elevenlabs.io) (`@elevenlabs/react`) |
| **Web Scraping** | [Firecrawl](https://firecrawl.dev) (`@mendable/firecrawl-js`) |
| **LLM Synthesis** | OpenAI GPT-4o-mini |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Backend** | Node.js, Express 5 |
| **Monorepo** | pnpm workspaces |
| **PDF Export** | html2pdf.js |
| **Hosting** | Replit |

---

## Project Structure

```
judgeiq/
├── artifacts/
│   ├── api-server/            # Express API (Firecrawl + OpenAI synthesis)
│   │   └── src/routes/
│   │       ├── research.ts    # POST /api/research — core pipeline
│   │       ├── firecrawl.ts   # POST /api/firecrawl/search — raw search
│   │       └── elevenlabs.ts  # GET /api/elevenlabs/signed-url
│   └── judge-iq/              # React + Vite frontend
│       └── src/
│           ├── hooks/
│           │   └── useElevenLabs.ts    # Voice AI + tool calling
│           ├── components/
│           │   ├── CSSOrb.tsx          # Animated orb (4 states)
│           │   ├── Citations.tsx       # Source citation grid
│           │   ├── SystemLogs.tsx      # Real-time log terminal
│           │   └── views/
│           │       ├── IdleView.tsx       # Landing screen
│           │       ├── ProcessingView.tsx # Firecrawl scraping
│           │       └── ResultsView.tsx    # Judicial profile dashboard
│           └── context/
│               └── VoiceStateContext.tsx  # Central state machine
└── lib/                       # Shared packages
    ├── api-spec/              # OpenAPI specification
    ├── api-client-react/      # Generated React Query hooks
    ├── api-zod/               # Generated Zod schemas
    └── db/                    # Drizzle ORM + PostgreSQL
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Environment Variables

| Variable | Description |
|----------|-------------|
| `FIRECRAWL_API_KEY` | API key from [firecrawl.dev](https://firecrawl.dev) |
| `ELEVENLABS_API_KEY` | API key from [elevenlabs.io](https://elevenlabs.io) |
| `VITE_ELEVENLABS_AGENT_ID` | Your ElevenLabs Conversational AI agent ID |
| `OPENAI_API_KEY` | OpenAI API key (or use Replit AI Integrations) |

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/judge-iq.git
cd judge-iq

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/judge-iq run dev
```

### ElevenLabs Agent Setup

1. Create a new Conversational AI agent at [elevenlabs.io](https://elevenlabs.io)
2. Add a client tool called `firecrawl_search` with a `query` string parameter
3. Configure the agent's system prompt to use the tool when a judge's name is mentioned
4. Copy the Agent ID to `VITE_ELEVENLABS_AGENT_ID`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | Full research pipeline: Firecrawl search + OpenAI synthesis |
| `POST` | `/api/firecrawl/search` | Raw Firecrawl search passthrough |
| `GET` | `/api/elevenlabs/signed-url` | Generate signed WebSocket URL for ElevenLabs |
| `GET` | `/api/health` | Health check |

### Research Endpoint

```bash
curl -X POST http://localhost:8080/api/research \
  -H "Content-Type: application/json" \
  -d '{"query": "Judge Ketanji Brown Jackson"}'
```

**Response:**
```json
{
  "success": true,
  "query": "Judge Ketanji Brown Jackson",
  "spoken_script": "Judge Ketanji Brown Jackson is an Associate Justice...",
  "tendencies": [
    "Applies rigorous procedural standards in federal sentencing cases...",
    "Demonstrates careful attention to discovery disputes..."
  ],
  "biases": [
    "Shows progressive judicial philosophy rooted in public defender experience...",
    "Demonstrates heightened sensitivity to criminal justice reform..."
  ],
  "results": [
    { "url": "https://...", "title": "...", "description": "...", "markdown": "..." }
  ]
}
```

---

## Design

- **Theme:** Dark professional — Navy (#0A0E1A), Slate, Gold (#D4AF37)
- **Typography:** Cinzel (headings), Plus Jakarta Sans (body), JetBrains Mono (logs)
- **Visual Style:** Glassmorphism panels, CSS-only animated orb, Framer Motion transitions
- **All visuals are CSS/SVG — no video files**

---

## Built With

- [ElevenLabs](https://elevenlabs.io) — Conversational AI and voice synthesis
- [Firecrawl](https://firecrawl.dev) — Web scraping and search API
- [OpenAI](https://openai.com) — GPT-4o-mini for legal data synthesis
- [Replit](https://replit.com) — Development and hosting platform

---

## Team

> *Add your team members here*

---

## License

This project was built for [ElevenHacks](https://elevenlabs.io).
